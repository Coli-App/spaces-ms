import { IsInt, Min, Max, IsString, Matches, ValidateIf, registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


function IsStartBeforeEnd(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStartBeforeEnd',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const obj = args.object as any;
          if (!obj.time_start || !obj.time_end) return true;
          return obj.time_start < obj.time_end;
        },
        defaultMessage(args: ValidationArguments) {
          return 'time_start debe ser anterior a time_end';
        },
      },
    });
  };
}

export class ScheduleDto {
  @ApiProperty({
    description: 'Día de la semana (0=Domingo, 1=Lunes, ..., 6=Sábado)',
    example: 1,
    minimum: 0,
    maximum: 6,
    type: Number
  })
  @IsInt({ message: 'day debe ser un número entero' })
  @Min(0, { message: 'day debe ser mínimo 0 (Domingo)' })
  @Max(6, { message: 'day debe ser máximo 6 (Sábado)' })
  day: number;

  @ApiProperty({
    description: 'Hora de inicio en formato HH:MM (24 horas)',
    example: '08:00',
    type: String,
    pattern: '^([01]\\d|2[0-3]):[0-5]\\d$'
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'time_start debe estar en formato HH:MM (00:00 - 23:59)',
  })
  @IsStartBeforeEnd()
  time_start: string;

  @ApiProperty({
    description: 'Hora de fin en formato HH:MM (24 horas)',
    example: '20:00',
    type: String,
    pattern: '^([01]\\d|2[0-3]):[0-5]\\d$'
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'time_end debe estar en formato HH:MM (00:00 - 23:59)',
  })
  time_end: string;
}
