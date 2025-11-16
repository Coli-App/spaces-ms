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
    const { deportes_permitidos, ...espacioData } = createSpaceDto;
    const { data: espacio, error: espacioError } = await this.supabase
      .from('espacios')
      .insert({
        nombre: espacioData.nombre,
        estado: espacioData.estado,
        ubicacion: espacioData.ubicacion,
        capacidad: espacioData.capacidad,
      })
      .select()
      .single();

    if (espacioError) {
      throw new InternalServerErrorException(
        `Error al crear espacio: ${espacioError.message}`,
      );
    }

    const espacioDeporteRecords = deportes_permitidos.map((deporteId) => ({
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
        nombre,
        estado,
        ubicacion,
        capacidad,
        espacio_deporte (
          deportes (
            id,
            nombre
          )
        )
      `);

    if (userToken) {
      const { data: userData } = await this.supabase.auth.getUser(userToken);
      const userRole = userData?.user?.user_metadata?.rol;

      if (userRole !== 'Administrador') {
        query = query.eq('estado', EstadoEspacio.ACTIVO);
      }
    } else {
      query = query.eq('estado', EstadoEspacio.ACTIVO);
    }

    const { data, error } = await query;

    if (error) {
      throw new InternalServerErrorException(
        `Error al listar espacios: ${error.message}`,
      );
    }


    return data.map((espacio: any) => ({
      id: espacio.id,
      nombre: espacio.nombre,
      estado: espacio.estado,
      ubicacion: espacio.ubicacion,
      capacidad: espacio.capacidad,
      deportes: espacio.espacio_deporte.map((ed: any) => ed.deportes),
    }));
  }

  async activateSpace(id: number): Promise<{ message: string }> {
    const { data, error } = await this.supabase
      .from('espacios')
      .update({ estado: EstadoEspacio.ACTIVO })
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
      .update({ estado: EstadoEspacio.INACTIVO })
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