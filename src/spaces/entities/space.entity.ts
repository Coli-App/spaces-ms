export interface Space {
  id: number;
  nombre: string;
  estado: string;
  ubicacion: string;
  descripcion: string;
  capacidad: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface EspacioDeporte {
  id: number;
  espacio_id: number;
  deporte_id: number;
}