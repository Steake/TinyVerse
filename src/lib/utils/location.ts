import type { Location } from '../stores/world';

export function createNewLocation(type: Location['type'], x: number, y: number): Location {
  return {
    id: crypto.randomUUID(),
    name: '',
    type,
    description: '',
    x,
    y,
    width: 100,
    height: 100
  };
}

export function getLocationIcon(type: Location['type']): string {
  const icons = {
    room: '🏠',
    outdoor: '🌳',
    special: '✨'
  };
  return icons[type];
}