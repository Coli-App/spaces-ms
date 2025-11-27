import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateSpaceDto, EstadoEspacio } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { SpaceResponseDto } from './dto/space-response.dto';
import { CloudflareService } from 'src/providers/cloudflare/cloudflare.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SpacesService {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
    private readonly cloudflareService: CloudflareService,
    private readonly configService: ConfigService,
  ) {}

  async createSpace(
    createSpaceDto: CreateSpaceDto,
    image?: Express.Multer.File,
  ): Promise<SpaceResponseDto> {
   
  
    const { sports, schedule, ...spaceData } = createSpaceDto;
 
    let imageKey = '';

    if (image) {
      const key = `spaces/${Date.now()}_${image.originalname}`;
      imageKey = await this.cloudflareService.uploadFile(
        key,
        image.buffer,
        image.mimetype,
      );
    }


    if (schedule && schedule.length > 0) {
      const days = schedule.map(s => s.day);
      const uniqueDays = new Set(days);
      if (days.length !== uniqueDays.size) {
        throw new BadRequestException('No se permiten días duplicados en el horario');
      }

      const invalidDays = days.filter(day => day < 0 || day > 6);
      if (invalidDays.length > 0) {
        throw new BadRequestException('Los días deben estar entre 0 (Domingo) y 6 (Sábado)');
      }
    }

    const { data: espacio, error: espacioError } = await this.supabase
      .from('espacios')
      .insert({
        name: spaceData.name,
        state: spaceData.state,
        ubication: spaceData.ubication,
        description: spaceData.description,
        capacity: spaceData.capacity,
        urlpath: imageKey,
      })
      .select()
      .single();

    if (espacioError) {
      throw new InternalServerErrorException(
        `Error al crear espacio: ${espacioError.message}`,
      );
    }

    const scheduleMap = schedule && schedule.length > 0 
      ? new Map(schedule.map(s => [s.day, s])) 
      : new Map();

    const horariosRecords: Array<{
      id_espacio: number;
      day: number;
      time_start: string;
      time_end: string;
      closed: boolean;
    }> = [];
    for (let day = 0; day <= 6; day++) {
      const daySchedule = scheduleMap.get(day);
      horariosRecords.push({
        id_espacio: espacio.id,
        day: day,
        time_start: daySchedule ? daySchedule.time_start : '00:00',
        time_end: daySchedule ? daySchedule.time_end : '23:59',
        closed: !daySchedule,
      });
    }

    const { error: horariosError } = await this.supabase
      .from('horarios')
      .insert(horariosRecords);

    if (horariosError) {
      await this.supabase.from('espacios').delete().eq('id', espacio.id);
      throw new InternalServerErrorException(
        `Error al crear horarios: ${horariosError.message}`,
      );
    }

    const espacioDeporteRecords = sports.map((deporteId) => ({
      espacio_id: espacio.id,
      deporte_id: deporteId,
    }));

    const { error: relacionError } = await this.supabase
      .from('espacio_deporte')
      .insert(espacioDeporteRecords);

    if (relacionError) {
      await this.supabase.from('horarios').delete().eq('id_espacio', espacio.id);
      await this.supabase.from('espacios').delete().eq('id', espacio.id);

      throw new InternalServerErrorException(
        `Error al asociar deportes: ${relacionError.message}`,
      );
    }

    return {
      ...espacio,
      imageUrl: imageKey
        ? await this.cloudflareService.getFileUrl(imageKey)
        : null,
    };
  }

  async listSpaces(userToken?: string): Promise<SpaceResponseDto[]> {
    let query = this.supabase.from('espacios').select(`
        id,
        name,
        state,
        ubication,
        description,
        capacity,
        urlpath,
        espacio_deporte (
          deportes (
            id,
            name
          )
        ),
        horarios (
          id,
          day,
          time_start,
          time_end,
          closed,
          semana (
            name
          )
        )
      `);

    if (userToken) {
      const { data: userData } = await this.supabase.auth.getUser(userToken);
      const userRole = userData.user?.app_metadata.user_role;

      if (userRole !== 'admin') {
        query = query.eq('state', EstadoEspacio.ACTIVO);
      }
    } else {
      query = query.eq('state', EstadoEspacio.ACTIVO);
    }

    const { data, error } = await query;

    if (error) {
      throw new InternalServerErrorException(
        `Error al listar espacios: ${error.message}`,
      );
    }

    const spacesWithSignedUrls = await Promise.all(
      data.map(async (space: any) => {
        let signedUrl = '';
        if (space.urlpath) {
          signedUrl = await this.cloudflareService.getFileUrl(space.urlpath);
        }

        return {
          id: space.id,
          name: space.name,
          state: space.state,
          ubication: space.ubication,
          description: space.description,
          capacity: space.capacity,
          imageUrl: signedUrl,
          sports: space.espacio_deporte.map((ed: any) => ed.deportes),
          schedule: space.horarios
        .sort((a: any, b: any) => a.day - b.day)
        .map((h: any) => ({
          id: h.id,
          day: h.semana?.name || h.day,
          time_start: h.time_start,
          time_end: h.time_end,
          closed: h.closed,
        })),
    }
      }),
    );

    return spacesWithSignedUrls;
  }

  async getSpaceById(id: number): Promise<SpaceResponseDto> {
    const { data, error } = await this.supabase
      .from('espacios')
      .select(
        `
        id,
        name,
        state,
        ubication,
        description,
        capacity,
        urlpath,
        espacio_deporte (
          deportes (
            id,
            name
          )
        ),
        horarios (
          id,
          day,
          time_start,
          time_end,
          closed,
          semana (
            name
          )
        )
      `,
      )
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException(`Espacio con ID ${id} no encontrado`);
      }
      throw new InternalServerErrorException(
        `Error al obtener espacio: ${error.message}`,
      );
    }

    let signedUrl = '';
    if (data.urlpath) {
      signedUrl = await this.cloudflareService.getFileUrl(data.urlpath);
    }

    return {
      id: data.id,
      name: data.name,
      state: data.state,
      ubication: data.ubication,
      description: data.description,
      capacity: data.capacity,
      imageUrl: signedUrl,
      sports: data.espacio_deporte.map((ed: any) => ed.deportes),
      schedule: data.horarios
        .sort((a: any, b: any) => a.day - b.day)
        .map((h: any) => ({
          id: h.id,
          day: h.semana?.name || h.day,
          time_start: h.time_start,
          time_end: h.time_end,
          closed: h.closed,
        })),
    };
  }

  async activateSpace(id: number): Promise<{ message: string }> {
    const { data, error } = await this.supabase
      .from('espacios')
      .update({ state: EstadoEspacio.ACTIVO })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(
        `Error al activar espacio: ${error.message}`,
      );
    }

    if (!data) {
      throw new NotFoundException(`Espacio con ID ${id} no encontrado`);
    }

    return { message: `Espacio ${data.nombre} activado exitosamente` };
  }

  async inactivateSpace(id: number): Promise<{ message: string }> {
    const { data, error } = await this.supabase
      .from('espacios')
      .update({ state: EstadoEspacio.INACTIVO })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(
        `Error al inactivar espacio: ${error.message}`,
      );
    }

    if (!data) {
      throw new NotFoundException(`Espacio con ID ${id} no encontrado`);
    }

    return { message: `Espacio ${data.nombre} inactivado exitosamente` };
  }

  async updateSpace(id: number, updateSpaceDto: UpdateSpaceDto): Promise<SpaceResponseDto> {
  
    const { data: existingSpace } = await this.supabase
      .from('espacios')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingSpace) {
      throw new NotFoundException(`Espacio con ID ${id} no encontrado`);
    }

    const { sports, ...espacioData } = updateSpaceDto;
   
    const updateData: any = {};
    if (espacioData.name !== undefined) updateData.name = espacioData.name;
    if (espacioData.state !== undefined) updateData.state = espacioData.state;
    if (espacioData.ubication !== undefined) updateData.ubication = espacioData.ubication;
    if (espacioData.description !== undefined) updateData.description = espacioData.description;
    if (espacioData.capacity !== undefined) updateData.capacity = espacioData.capacity;
    if (espacioData.urlpath !== undefined) updateData.urlpath = espacioData.urlpath;


    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await this.supabase
        .from('espacios')
        .update(updateData)
        .eq('id', id);

      if (updateError) {
        throw new InternalServerErrorException(
          `Error al actualizar espacio: ${updateError.message}`,
        );
      }
    }

    if (sports && sports.length > 0) {
      const { error: deleteError } = await this.supabase
        .from('espacio_deporte')
        .delete()
        .eq('espacio_id', id);

      if (deleteError) {
        throw new InternalServerErrorException(
          `Error al eliminar deportes anteriores: ${deleteError.message}`,
        );
      }

      const espacioDeporteRecords = sports.map((deporteId) => ({
        espacio_id: id,
        deporte_id: deporteId,
      }));

      const { error: insertError } = await this.supabase
        .from('espacio_deporte')
        .insert(espacioDeporteRecords);

      if (insertError) {
        throw new InternalServerErrorException(
          `Error al asociar nuevos deportes: ${insertError.message}`,
        );
      }
    }

    return this.getSpaceById(id);
  }

  async deleteSpace(id: number): Promise<{ message: string }> {
    const { data: existingSpace } = await this.supabase
      .from('espacios')
      .select('name')
      .eq('id', id)
      .single();

    if (!existingSpace) {
      throw new NotFoundException(`Espacio con ID ${id} no encontrado`);
    }

    const { error: deportesError } = await this.supabase
      .from('espacio_deporte')
      .delete()
      .eq('espacio_id', id);

    if (deportesError) {
      throw new InternalServerErrorException(
        `Error al eliminar relaciones con deportes: ${deportesError.message}`,
      );
    }

    const { error: horariosError } = await this.supabase
      .from('horarios')
      .delete()
      .eq('id_espacio', id);

    if (horariosError) {
      throw new InternalServerErrorException(
        `Error al eliminar horarios: ${horariosError.message}`,
      );
    }

    const { error: espacioError } = await this.supabase
      .from('espacios')
      .delete()
      .eq('id', id);

    if (espacioError) {
      throw new InternalServerErrorException(
        `Error al eliminar espacio: ${espacioError.message}`,
      );
    }

    return { message: `Espacio "${existingSpace.name}" eliminado exitosamente` };
  }
}
