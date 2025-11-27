import { IsString, IsNotEmpty, IsNumber, IsArray, IsEnum, ArrayMinSize, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ScheduleDto } from './schedule.dto';

export enum EstadoEspacio {
  ACTIVO = 'Activo',
  INACTIVO = 'Inactivo',
}

export class CreateSpaceDto {
  @ApiProperty({
    description: 'Nombre del espacio deportivo',
    example: 'Cancha de Fútbol Principal',
    type: String
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Estado del espacio (Activo o Inactivo)',
    enum: EstadoEspacio,
    example: EstadoEspacio.ACTIVO
  })
  @IsEnum(EstadoEspacio)
  state: EstadoEspacio;

  @ApiProperty({
    description: 'Ubicación física del espacio',
    example: 'Sector Norte, Edificio Deportes',
    type: String
  })
  @IsString()
  @IsNotEmpty()
  ubication: string;

  
  @ApiProperty({
    description: 'Información detallada sobre el espacio deportivo',
    example: 'Objetivo de su creación, características principales, y cualquier otra información relevante.',
    type: String
  })
  @IsString()
  @IsNotEmpty()
   description: string;


  @ApiProperty({
    description: 'Capacidad máxima de personas',
    example: 22,
    type: Number
  })
  @IsNumber()
  capacity: number;

  @ApiProperty({
    description: 'IDs de los deportes permitidos en este espacio',
    example: [1, 2, 3],
    type: [Number],
    isArray: true
  })
  @IsArray()
  @ArrayMinSize(1)
  sports: number[];

  @ApiProperty({
    description: 'URL o ruta de la imagen del espacio',
    example: '/spaces/cancha-futbol-principal',
    type: String,
    required: false
  })
  @IsString()
  @IsOptional()
  urlpath?: string;

  @ApiProperty({
    description: 'Horario de disponibilidad del espacio por día de la semana',
    example: [
      { day: 1, time_start: '08:00', time_end: '20:00' },
      { day: 2, time_start: '08:00', time_end: '20:00' },
      { day: 3, time_start: '08:00', time_end: '20:00' },
      { day: 4, time_start: '08:00', time_end: '20:00' },
      { day: 5, time_start: '08:00', time_end: '18:00' }
    ],
    type: [ScheduleDto],
    isArray: true
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleDto)
  schedule: ScheduleDto[];
}