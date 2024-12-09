<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Agent, Relationship } from '../../../stores/agents';
  import Modal from '../../common/Modal.svelte';

  export let show = false;
  export let sourceAgent: Agent | undefined;
  export let targetAgent: Agent | undefined;
  export let relationship: Relationship | null = null;

  const dispatch = createEventDispatcher<{
    save: Relationship;
    close: void;
  }>();

  let editingRelationship: Relationship = relationship ? { ...relationship } : {
    targetId: targetAgent?.id || '',
    type: 'friend',
    strength: 3,
    description: ''
  };

  $: if (targetAgent && !relationship) {
    editingRelationship.targetId = targetAgent.id;
  }

  function handleSubmit() {
    dispatch('save', editingRelationship);
  }
</script>

<Modal
  show={show}
  title={relationship ? 'Edit Relationship' : 'New Relationship'}
  on:close={() => dispatch('close')}
>
  {#if sourceAgent && targetAgent}
    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
      <div class="text-sm">
        <span class="font-bold">{sourceAgent.name}</span>
        <span class="mx-2">→</span>
        <span class="font-bold">{targetAgent.name}</span>
      </div>

      <div class="form-control">
        <label class="label" for="type">Type</label>
        <select
          id="type"
          bind:value={editingRelationship.type}
          class="select select-bordered"
        >
          <option value="friend">Friend</option>
          <option value="colleague">Colleague</option>
          <option value="family">Family</option>
          <option value="rival">Rival</option>
        </select>
      </div>

      <div class="form-control">
        <label class="label" for="strength">
          Strength
          <span class="label-text-alt">{editingRelationship.strength}/5</span>
        </label>
        <input
          type="range"
          id="strength"
          bind:value={editingRelationship.strength}
          min="1"
          max="5"
          step="1"
          class="range"
        />
      </div>

      <div class="form-control">
        <label class="label" for="description">Description</label>
        <textarea
          id="description"
          bind:value={editingRelationship.description}
          class="textarea textarea-bordered"
          rows="3"
        />
      </div>

      <div class="modal-action">
        <button type="button" class="btn" on:click={() => dispatch('close')}>
          Cancel
        </button>
        <button type="submit" class="btn btn-primary">Save</button>
      </div>
    </form>
  {/if}
</Modal>