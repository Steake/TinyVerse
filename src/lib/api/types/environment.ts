import type { Location, Connection } from '../../stores/world';

export interface EnvironmentDTO {
  id: string;
  name: string;
  locations: Location[];
  connections: Connection[];
  description?: string;
}

export interface CreateEnvironmentRequest {
  name: string;
  description?: string;
}

export interface UpdateEnvironmentRequest {
  name?: string;
  description?: string;
  locations?: Location[];
  connections?: Connection[];
}

export interface EnvironmentObservationResponse {
  observations: string;
}
