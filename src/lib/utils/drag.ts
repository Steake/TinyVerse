export function handleLocationDragStart(event: DragEvent, type: 'room' | 'outdoor' | 'special') {
  if (event.dataTransfer) {
    event.dataTransfer.setData('location-type', type);
    event.dataTransfer.effectAllowed = 'copy';
  }
}

export function handleLocationDrop(event: DragEvent): 'room' | 'outdoor' | 'special' | null {
  event.preventDefault();
  const type = event.dataTransfer?.getData('location-type') as 'room' | 'outdoor' | 'special';
  return type || null;
}