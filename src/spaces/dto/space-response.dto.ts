export class SpaceResponseDto {
  id: number;
  name: string;
  state: string;
  ubication: string;
  capacity: number;
  urlpath?: string;
  sports?: Array<{ id: number; name: string }>;
  schedule?: Array<{
    id?: number;
    day: number;
    time_start: string | null;
    time_end: string | null;
    closed: boolean;
  }>;
}