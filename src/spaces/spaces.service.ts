import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateSpaceDto, EstadoEspacio } from './dto/create-space.dto';
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
    const { sports, ...spaceData } = createSpaceDto;

    let imageKey = '';

    if (image) {
      const key = `spaces/${Date.now()}_${image.originalname}`;
      imageKey = await this.cloudflareService.uploadFile(
        key,
        image.buffer,
        image.mimetype,
      );
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
        };
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
