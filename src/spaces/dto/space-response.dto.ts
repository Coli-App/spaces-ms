export class SpaceResponseDto {
  id: number;
  name: string;
  state: string;
  ubication: string;
  description: string;
  capacity: number;
  imageUrl?: string;
  sports: number[]; 
}