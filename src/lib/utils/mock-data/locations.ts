import type { Location, Connection } from '../../stores/types';

export const mockLocations: Location[] = [
  {
    id: 'office-1',
    name: 'Main Office',
    type: 'room',
    description: 'Open plan office space with standing desks and meeting areas',
    x: 100,
    y: 100,
    width: 200,
    height: 150
  },
  {
    id: 'cafe-1',
    name: 'Coffee Corner',
    type: 'room',
    description: 'Cozy café area with coffee machines and snacks',
    x: 400,
    y: 100,
    width: 150,
    height: 100
  },
  {
    id: 'office-2',
    name: 'Design Studio',
    type: 'room',
    description: 'Creative space with whiteboards and design tools',
    x: 100,
    y: 300,
    width: 180,
    height: 120
  },
  {
    id: 'outdoor-1',
    name: 'Courtyard',
    type: 'outdoor',
    description: 'Peaceful outdoor area with benches and plants',
    x: 400,
    y: 300,
    width: 200,
    height: 200
  }
];

export const mockConnections: Connection[] = [
  {
    id: 'conn-1',
    source: 'office-1',
    target: 'cafe-1',
    type: 'path'
  },
  {
    id: 'conn-2',
    source: 'office-1',
    target: 'office-2',
    type: 'door'
  },
  {
    id: 'conn-3',
    source: 'cafe-1',
    target: 'outdoor-1',
    type: 'door'
  }
];