<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Location } from '../../../stores/world';
  import { gsap } from 'gsap';
  
  const locationTypes = [
    { 
      type: 'room',
      icon: '🏠',
      label: 'Room',
      description: 'Indoor spaces like offices, homes, or meeting areas',
      color: 'bg-blue-500/20 border-blue-500'
    },
    { 
      type: 'outdoor',
      icon: '🌳',
      label: 'Outdoor',
      description: 'Open spaces like parks, streets, or gardens',
      color: 'bg-green-500/20 border-green-500'
    },
    { 
      type: 'special',
      icon: '✨',
      label: 'Special',
      description: 'Unique locations with special properties',
      color: 'bg-purple-500/20 border-purple-500'
    }
  ] as const;

  const dispatch = createEventDispatcher<{
    dragStart: { type: Location['type'] };
    dragEnd: void;
  }>();

  function handleDragStart(event: DragEvent, type: Location['type']) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('location-type', type);
      event.dataTransfer.effectAllowed = 'copy';

      // Add visual feedback
      const target = event.target as HTMLElement;
      gsap.to(target, {
        scale: 0.95,
        opacity: 0.7,
        duration: 0.2
      });

      dispatch('dragStart', { type });
      
      // Remove the animation when drag ends
      const handleDragEnd = () => {
        gsap.to(target, {
          scale: 1,
          opacity: 1,
          duration: 0.2
        });
        dispatch('dragEnd');
        target.removeEventListener('dragend', handleDragEnd);
      };
      target.addEventListener('dragend', handleDragEnd);
    }
  }

  function handleKeyDown(event: KeyboardEvent, type: Location['type']) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const target = event.target as HTMLElement;
      target.setAttribute('draggable', 'true');
      const dragEvent = new DragEvent('dragstart', {
        dataTransfer: new DataTransfer(),
        bubbles: true
      });
      target.dispatchEvent(dragEvent);
    }
  }
</script>

<div class="space-y-4">
  <h3 class="text-lg font-semibold">Location Types</h3>
  <div class="grid grid-cols-1 gap-4">
    {#each locationTypes as locationType}
      <div
        class="card border-2 {locationType.color} hover:shadow-lg transition-all cursor-move relative overflow-hidden group"
        draggable="true"
        on:dragstart={(e) => handleDragStart(e, locationType.type)}
        on:keydown={(e) => handleKeyDown(e, locationType.type)}
        role="button"
        tabindex="0"
        aria-label={`Drag to create ${locationType.label}`}
      >
        <div class="card-body p-4">
          <div class="flex items-center gap-3">
            <div class="text-2xl" aria-hidden="true">
              {locationType.icon}
            </div>
            <div>
              <h4 class="font-semibold">{locationType.label}</h4>
              <p class="text-sm opacity-70">{locationType.description}</p>
            </div>
          </div>

          <!-- Drag handle indicator -->
          <div class="absolute top-0 right-0 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="12" r="1" />
              <circle cx="9" cy="5" r="1" />
              <circle cx="9" cy="19" r="1" />
              <circle cx="15" cy="12" r="1" />
              <circle cx="15" cy="5" r="1" />
              <circle cx="15" cy="19" r="1" />
            </svg>
          </div>

          <!-- Hover effect overlay -->
          <div class="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity" />
        </div>
      </div>
    {/each}
  </div>
</div>

<style lang="postcss">
  .card {
    @apply relative;
  }

  .card:hover {
    @apply ring-2 ring-base-300;
  }

  .card:focus {
    @apply ring-2 ring-primary outline-none;
  }

  .card[draggable="true"] {
    @apply cursor-grab active:cursor-grabbing;
  }
</style>