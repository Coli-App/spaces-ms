import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SportsService } from './sports.service';
import { SportDto } from './dto/sport.dto';
import { CreateSportDto } from './dto/create-sport.dto';

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

  @Post('create-sport')
  @ApiOperation({ 
    summary: 'Crear un nuevo deporte',
    description: 'Crea un nuevo deporte en el sistema. El ID se asigna automáticamente.'
  })
  @ApiBody({ type: CreateSportDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Deporte creado exitosamente',
    type: SportDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos inválidos' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error interno del servidor' 
  })
  async createSport(
    @Body() createSportDto: CreateSportDto,
  ): Promise<SportDto> {
    return this.sportsService.createSport(createSportDto);
  }
}