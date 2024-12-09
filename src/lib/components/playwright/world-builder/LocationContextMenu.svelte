<script lang="ts">
  import type { Location } from '../../../stores/world';

  export let show: boolean;
  export let x: number;
  export let y: number;
  export let location: Location | null;

  const handleEdit = () => {
    if (location) {
      const event = new CustomEvent('edit', { detail: location });
      dispatchEvent(event);
    }
  };

  const handleDelete = () => {
    if (location) {
      const event = new CustomEvent('delete', { detail: location });
      dispatchEvent(event);
    }
  };
</script>

{#if show}
  <div
    class="absolute z-10 bg-base-100 border border-base-content/20 rounded-md shadow-md p-2"
    style="left: {x}px; top: {y}px;"
  >
    <button on:click={handleEdit} class="btn btn-sm btn-ghost w-full">Edit</button>
    <button on:click={handleDelete} class="btn btn-sm btn-ghost btn-error w-full mt-2">Delete</button>
  </div>
{/if}
