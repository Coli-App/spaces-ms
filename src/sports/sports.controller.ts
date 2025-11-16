import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SportsService } from './sports.service';
import { SportDto } from './dto/sport.dto';

@ApiTags('Deportes')
@Controller('sports')
export class SportsController {
  constructor(private readonly sportsService: SportsService) {}

  @Get('list-sports')
  @ApiOperation({ 
    summary: 'Listar todos los deportes disponibles',
    description: 'Obtiene la lista completa de deportes registrados en el sistema, ordenados alfabéticamente por nombre'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de deportes obtenida exitosamente',
    type: [SportDto] 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor' 
  })
  async listSports(): Promise<SportDto[]> {
    return this.sportsService.listSports();
  }
}