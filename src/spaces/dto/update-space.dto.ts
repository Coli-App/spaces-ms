import { IsString, IsNotEmpty, IsNumber, IsArray, IsEnum, ArrayMinSize, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EstadoEspacio } from './create-space.dto';

export class UpdateSpaceDto {
  @ApiProperty({
    description: 'Nombre del espacio deportivo',
    example: 'Cancha de Fútbol Principal',
    type: String,
    required: false
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Estado del espacio (Activo o Inactivo)',
    enum: EstadoEspacio,
    example: EstadoEspacio.ACTIVO,
    required: false
  })
  @IsEnum(EstadoEspacio)
  @IsOptional()
  state?: EstadoEspacio;

  @ApiProperty({
    description: 'Ubicación física del espacio',
    example: 'Sector Norte, Edificio Deportes',
    type: String,
    required: false
  })
  @IsString()
  @IsOptional()
  ubication?: string;

  @ApiProperty({
    description: 'Capacidad máxima de personas',
    example: 22,
    type: Number,
    required: false
  })
  @IsNumber()
  @IsOptional()
  capacity?: number;

  @ApiProperty({
    description: 'IDs de los deportes permitidos en este espacio',
    example: [1, 2, 3],
    type: [Number],
    isArray: true,
    required: false
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsOptional()
  sports?: number[];

  @ApiProperty({
    description: 'URL o ruta de la imagen del espacio',
    example: '/spaces/cancha-futbol-principal',
    type: String,
    required: false
  })
  @IsString()
  @IsOptional()
  urlpath?: string;
}
