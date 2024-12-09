<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Location, Connection } from '../../../stores/world';
  import BaseModal from '../../common/BaseModal.svelte';

  export let show = false;
  export let source: Location | null = null;
  export let target: Location | null = null;

  const dispatch = createEventDispatcher<{
    save: Connection;
    close: void;
  }>();

  let type: Connection['type'] = 'path';

  function handleSubmit() {
    if (source && target) {
      const connection: Connection = {
        id: crypto.randomUUID(),
        source: source.id,
        target: target.id,
        type
      };
      dispatch('save', connection);
    }
  }

  function handleClose() {
    dispatch('close');
  }
</script>

<BaseModal
  {show}
  title="Create Connection"
  on:close={handleClose}
>
  {#if source && target}
    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
      <div class="text-sm">
        <span class="font-bold">{source.name}</span>
        <span class="mx-2">→</span>
        <span class="font-bold">{target.name}</span>
      </div>

      <div class="form-control">
        <label class="label" for="type">
          <span class="label-text">Connection Type</span>
        </label>
        <select
          id="type"
          bind:value={type}
          class="select select-bordered w-full"
          required
        >
          <option value="path">Path</option>
          <option value="door">Door</option>
          <option value="portal">Portal</option>
        </select>
      </div>

      <div class="modal-action">
        <button type="button" class="btn" on:click={handleClose}>Cancel</button>
        <button type="submit" class="btn btn-primary">Create Connection</button>
      </div>
    </form>
  {/if}
</BaseModal>