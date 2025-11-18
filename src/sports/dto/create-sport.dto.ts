import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSportDto {
  @ApiProperty({
    description: 'Nombre del deporte',
    example: 'Fútbol',
    type: String
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
