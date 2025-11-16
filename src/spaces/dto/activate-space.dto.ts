import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActivateSpaceDto {
  @ApiProperty({
    description: 'ID del espacio a activar/inactivar',
    example: 1,
    type: Number
  })
  @IsNumber()
  id: number;
}