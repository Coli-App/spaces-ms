import {
  Inject,
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateSpaceDto, EstadoEspacio } from './dto/create-space.dto';
import { SpaceResponseDto } from './dto/space-response.dto';

@Injectable()
export class SpacesService {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) {}

  async createSpace(createSpaceDto: CreateSpaceDto): Promise<SpaceResponseDto> {
    const { sports, ...espacioData } = createSpaceDto;
    const { data: espacio, error: espacioError } = await this.supabase
      .from('espacios')
      .insert({
        name: espacioData.name,
        state: espacioData.state,
        ubication: espacioData.ubication,
        capacity: espacioData.capacity,
        urlpath: espacioData.urlpath,
      })
      .select()
      .single();

    if (espacioError) {
      throw new InternalServerErrorException(
        `Error al crear espacio: ${espacioError.message}`,
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
      await this.supabase.from('espacios').delete().eq('id', espacio.id);
      
      throw new InternalServerErrorException(
        `Error al asociar deportes: ${relacionError.message}`,
      );
    }

    return espacio;
  }

  async listSpaces(userToken?: string): Promise<SpaceResponseDto[]> {
    let query = this.supabase
      .from('espacios')
      .select(`
        id,
        name,
        state,
        ubication,
        capacity,
        urlpath,
        espacio_deporte (
          deportes (
            id,
            name
          )
        )
      `);

    if (userToken) {
      const { data: userData } = await this.supabase.auth.getUser(userToken);
      const userRole = userData?.user?.user_metadata?.rol;

      if (userRole !== 'Administrador') {
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


    return data.map((espacio: any) => ({
      id: espacio.id,
      name: espacio.name,
      state: espacio.state,
      ubication: espacio.ubication,
      capacity: espacio.capacity,
      sports: espacio.espacio_deporte.map((ed: any) => ed.deportes),
    }));
  }

  async getSpaceById(id: number): Promise<SpaceResponseDto> {
    const { data, error } = await this.supabase
      .from('espacios')
      .select(`
        id,
        name,
        state,
        ubication,
        capacity,
        urlpath,
        espacio_deporte (
          deportes (
            id,
            name
          )
        )
      `)
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

    return {
      id: data.id,
      name: data.name,
      state: data.state,
      ubication: data.ubication,
      capacity: data.capacity,
      urlpath: data.urlpath,
      sports: data.espacio_deporte.map((ed: any) => ed.deportes),
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
}