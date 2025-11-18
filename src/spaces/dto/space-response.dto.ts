export class SpaceResponseDto {
  id: number;
  name: string;
  state: string;
  ubication: string;
  capacity: number;
  urlpath?: string;
  sports?: Array<{ id: number; name: string }>;
}