export class SpaceResponseDto {
  id: number;
  name: string;
  state: string;
  ubication: string;
  description: string;
  capacity: number;
  imageUrl?: string;
  sports: number[]; 
    schedule?: Array<{
    id?: number;
    day: number;
    time_start: string | null;
    time_end: string | null;
    closed: boolean;
  }>;
}