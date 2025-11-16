export class SpaceResponseDto {
  id: number;
  nombre: string;
  estado: string;
  ubicacion: string;
  capacidad: number;
  deportes?: Array<{ id: number; nombre: string }>;
}