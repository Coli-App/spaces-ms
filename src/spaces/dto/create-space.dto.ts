import { IsString, IsNotEmpty, IsNumber, IsArray, IsEnum, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
  nombre: string;

  @ApiProperty({
    description: 'Estado del espacio (Activo o Inactivo)',
    enum: EstadoEspacio,
    example: EstadoEspacio.ACTIVO
  })
  @IsEnum(EstadoEspacio)
  estado: EstadoEspacio;

  @ApiProperty({
    description: 'Ubicación física del espacio',
    example: 'Sector Norte, Edificio Deportes',
    type: String
  })
  @IsString()
  @IsNotEmpty()
  ubicacion: string;

  @ApiProperty({
    description: 'Capacidad máxima de personas',
    example: 22,
    type: Number
  })
  @IsNumber()
  capacidad: number;

  @ApiProperty({
    description: 'IDs de los deportes permitidos en este espacio',
    example: [1, 2, 3],
    type: [Number],
    isArray: true
  })
  @IsArray()
  @ArrayMinSize(1)
  deportes_permitidos: number[];
}