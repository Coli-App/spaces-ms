import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SportDto } from './dto/sport.dto';
import { CreateSportDto } from './dto/create-sport.dto';

@Injectable()
export class SportsService {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) {}

  async listSports(): Promise<SportDto[]> {
    const { data, error } = await this.supabase
      .from('deportes')
      .select('id, name')
      .order('name', { ascending: true });

    if (error) {
      throw new InternalServerErrorException(
        `Error al obtener deportes: ${error.message}`,
      );
    }

    return data;
  }

  async createSport(createSportDto: CreateSportDto): Promise<SportDto> {
    const { data, error } = await this.supabase
      .from('deportes')
      .insert({
        name: createSportDto.name,
      })
      .select('id, name')
      .single();

    if (error) {
      throw new InternalServerErrorException(
        `Error al crear deporte: ${error.message}`,
      );
    }

    return data;
  }
}