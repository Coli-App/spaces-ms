import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SportDto } from './dto/sport.dto';

@Injectable()
export class SportsService {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) {}

  async listSports(): Promise<SportDto[]> {
    const { data, error } = await this.supabase
      .from('deportes')
      .select('id, nombre')
      .order('nombre', { ascending: true });

    if (error) {
      throw new InternalServerErrorException(
        `Error al obtener deportes: ${error.message}`,
      );
    }

    return data;
  }
}