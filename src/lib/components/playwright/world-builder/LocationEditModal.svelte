<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Location } from '../../../stores/world';
  import BaseModal from '../../common/BaseModal.svelte';

  export let show = false;
  export let location: Location | null = null;

  const dispatch = createEventDispatcher<{
    save: Location;
    close: void;
  }>();

  let formData: Partial<Location> = {};

  $: if (show && location) {
    formData = { ...location };
  }

  function handleSubmit() {
    if (formData) {
      dispatch('save', formData as Location);
    }
  }

  function handleClose() {
    dispatch('close');
  }
</script>

<BaseModal
  {show}
  title={location?.id ? 'Edit Location' : 'New Location'}
  on:close={handleClose}
>
  {#if formData}
    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
      <div class="form-control">
        <label class="label" for="locationName">
          <span class="label-text">Name</span>
        </label>
        <input
          type="text"
          id="locationName"
          class="input input-bordered"
          bind:value={formData.name}
          required
        />
      </div>

      <div class="form-control">
        <label class="label" for="locationType">
          <span class="label-text">Type</span>
        </label>
        <select
          id="locationType"
          class="select select-bordered"
          bind:value={formData.type}
          required
        >
          <option value="room">Room</option>
          <option value="outdoor">Outdoor</option>
          <option value="special">Special</option>
        </select>
      </div>

      <div class="form-control">
        <label class="label" for="locationDescription">
          <span class="label-text">Description</span>
        </label>
        <textarea
          id="locationDescription"
          class="textarea textarea-bordered"
          rows="3"
          bind:value={formData.description}
        />
      </div>

      <div class="modal-action">
        <button type="button" class="btn" on:click={handleClose}>Cancel</button>
        <button type="submit" class="btn btn-primary">Save</button>
      </div>
    </form>
  {/if}
</BaseModal>