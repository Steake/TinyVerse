export interface LocationDTO {
  id: string;
  name: string;
  type: 'room' | 'outdoor' | 'special';
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
  image?: string;
}

export interface ConnectionDTO {
  id: string;
  source: string;
  target: string;
  type: 'path' | 'door' | 'portal';
}

export interface CreateLocationRequest extends Omit<LocationDTO, 'id'> {}
export interface UpdateLocationRequest extends Partial<LocationDTO> {}

export interface CreateConnectionRequest extends Omit<ConnectionDTO, 'id'> {}