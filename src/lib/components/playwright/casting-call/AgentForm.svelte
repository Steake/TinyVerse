<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import type { Agent, Skill } from '../../../stores/types';
  import { groupStore } from '../../../stores/groups';
  import RichTextEditor from '../../common/RichTextEditor.svelte';

  export let agent: Partial<Agent> = {
    personalityTraits: [],
    professionalInterests: [],
    personalInterests: [],
    skills: [],
    relationships: [],
    routines: []
  };

  const dispatch = createEventDispatcher<{
    save: Agent;
    cancel: void;
  }>();

  let newTrait = '';
  let newProfessionalInterest = '';
  let newPersonalInterest = '';
  let newSkill = { name: '', level: 3 };
  let newGroupName = '';
  let mounted = false;

  onMount(() => {
    mounted = true;
  });

  function addTrait() {
    if (newTrait) {
      agent.personalityTraits = [...(agent.personalityTraits || []), newTrait];
      newTrait = '';
    }
  }

  function removeTrait(trait: string) {
    agent.personalityTraits = agent.personalityTraits?.filter(t => t !== trait);
  }

  function addInterest(type: 'personal' | 'professional') {
    const interest = type === 'personal' ? newPersonalInterest : newProfessionalInterest;
    if (interest) {
      if (type === 'personal') {
        agent.personalInterests = [...(agent.personalInterests || []), interest];
        newPersonalInterest = '';
      } else {
        agent.professionalInterests = [...(agent.professionalInterests || []), interest];
        newProfessionalInterest = '';
      }
    }
  }

  function removeInterest(interest: string, type: 'personal' | 'professional') {
    if (type === 'personal') {
      agent.personalInterests = agent.personalInterests?.filter(i => i !== interest);
    } else {
      agent.professionalInterests = agent.professionalInterests?.filter(i => i !== interest);
    }
  }

  function addSkill() {
    if (newSkill.name) {
      agent.skills = [...(agent.skills || []), { ...newSkill }];
      newSkill = { name: '', level: 3 };
    }
  }

  function removeSkill(skillName: string) {
    agent.skills = agent.skills?.filter(s => s.name !== skillName);
  }

  function handleCreateGroup() {
    if (newGroupName.trim()) {
      const groupId = crypto.randomUUID();
      groupStore.addGroup({
        id: groupId,
        name: newGroupName.trim()
      });
      agent.group = groupId;
      newGroupName = '';
    }
  }

  function handleSubmit() {
    const completeAgent: Agent = {
      id: agent.id || crypto.randomUUID(),
      name: agent.name || '',
      age: agent.age || 25,
      occupation: agent.occupation || '',
      occupationDescription: agent.occupationDescription || '',
      nationality: agent.nationality || '',
      countryOfResidence: agent.countryOfResidence || '',
      routines: agent.routines || [],
      personalityTraits: agent.personalityTraits || [],
      professionalInterests: agent.professionalInterests || [],
      personalInterests: agent.personalInterests || [],
      skills: agent.skills || [],
      relationships: agent.relationships || [],
      backstory: agent.backstory || '',
      emoji: agent.emoji || '👤',
      profilePicture: agent.profilePicture,
      group: agent.group
    };

    dispatch('save', completeAgent);
  }
</script>

{#if mounted}
<form on:submit|preventDefault={handleSubmit} class="space-y-6">
  <div class="grid grid-cols-2 gap-4">
    <div class="form-control">
      <label class="label" for="name">Name</label>
      <input
        type="text"
        id="name"
        bind:value={agent.name}
        class="input input-bordered"
        required
      />
    </div>

    <div class="form-control">
      <label class="label" for="age">Age</label>
      <input
        type="number"
        id="age"
        bind:value={agent.age}
        class="input input-bordered"
        min="0"
        required
      />
    </div>
  </div>

  <div class="form-control">
    <label class="label" for="group">Group</label>
    <div class="join w-full">
      {#if newGroupName}
        <input
          type="text"
          class="input input-bordered join-item w-full"
          bind:value={newGroupName}
          placeholder="New group name"
        />
        <button
          type="button"
          class="btn btn-primary join-item"
          on:click={handleCreateGroup}
        >
          Create
        </button>
      {:else}
        <select
          id="group"
          class="select select-bordered join-item w-full"
          bind:value={agent.group}
        >
          <option value="">No Group</option>
          {#each $groupStore as group}
            <option value={group.id}>{group.name}</option>
          {/each}
          <option value="new">+ Create New Group</option>
        </select>
      {/if}
    </div>
  </div>

  <!-- Rest of the form fields -->
  <div class="grid grid-cols-2 gap-4">
    <div class="form-control">
      <label class="label" for="nationality">Nationality</label>
      <input
        type="text"
        id="nationality"
        bind:value={agent.nationality}
        class="input input-bordered"
        required
      />
    </div>

    <div class="form-control">
      <label class="label" for="residence">Country of Residence</label>
      <input
        type="text"
        id="residence"
        bind:value={agent.countryOfResidence}
        class="input input-bordered"
        required
      />
    </div>
  </div>

  <div class="form-control">
    <label class="label" for="occupation">Occupation</label>
    <input
      type="text"
      id="occupation"
      bind:value={agent.occupation}
      class="input input-bordered"
      required
    />
  </div>

  <div class="form-control">
    <label class="label" for="occupationDescription">Occupation Description</label>
    <textarea
      id="occupationDescription"
      bind:value={agent.occupationDescription}
      class="textarea textarea-bordered"
      rows="3"
    />
  </div>

  <!-- Personality Traits -->
  <div class="form-control">
    <label class="label">Personality Traits</label>
    <div class="flex gap-2">
      <input
        type="text"
        bind:value={newTrait}
        class="input input-bordered flex-1"
        placeholder="Add a trait"
      />
      <button type="button" class="btn btn-primary" on:click={addTrait}>Add</button>
    </div>
    <div class="flex flex-wrap gap-2 mt-2">
      {#each agent.personalityTraits || [] as trait}
        <span class="badge badge-primary gap-2">
          {trait}
          <button type="button" class="btn btn-ghost btn-xs" on:click={() => removeTrait(trait)}>×</button>
        </span>
      {/each}
    </div>
  </div>

  <!-- Professional Interests -->
  <div class="form-control">
    <label class="label">Professional Interests</label>
    <div class="flex gap-2">
      <input
        type="text"
        bind:value={newProfessionalInterest}
        class="input input-bordered flex-1"
        placeholder="Add a professional interest"
      />
      <button type="button" class="btn btn-primary" on:click={() => addInterest('professional')}>Add</button>
    </div>
    <div class="flex flex-wrap gap-2 mt-2">
      {#each agent.professionalInterests || [] as interest}
        <span class="badge badge-secondary gap-2">
          {interest}
          <button type="button" class="btn btn-ghost btn-xs" on:click={() => removeInterest(interest, 'professional')}>×</button>
        </span>
      {/each}
    </div>
  </div>

  <!-- Personal Interests -->
  <div class="form-control">
    <label class="label">Personal Interests</label>
    <div class="flex gap-2">
      <input
        type="text"
        bind:value={newPersonalInterest}
        class="input input-bordered flex-1"
        placeholder="Add a personal interest"
      />
      <button type="button" class="btn btn-primary" on:click={() => addInterest('personal')}>Add</button>
    </div>
    <div class="flex flex-wrap gap-2 mt-2">
      {#each agent.personalInterests || [] as interest}
        <span class="badge badge-accent gap-2">
          {interest}
          <button type="button" class="btn btn-ghost btn-xs" on:click={() => removeInterest(interest, 'personal')}>×</button>
        </span>
      {/each}
    </div>
  </div>

  <!-- Skills -->
  <div class="form-control">
    <label class="label">Skills</label>
    <div class="flex gap-2">
      <input
        type="text"
        bind:value={newSkill.name}
        class="input input-bordered flex-1"
        placeholder="Skill name"
      />
      <input
        type="range"
        bind:value={newSkill.level}
        min="1"
        max="5"
        class="range range-primary w-32"
      />
      <span class="w-8 text-center">{newSkill.level}</span>
      <button type="button" class="btn btn-primary" on:click={addSkill}>Add</button>
    </div>
    <div class="flex flex-wrap gap-2 mt-2">
      {#each agent.skills || [] as skill}
        <span class="badge badge-info gap-2">
          {skill.name} (Level {skill.level})
          <button type="button" class="btn btn-ghost btn-xs" on:click={() => removeSkill(skill.name)}>×</button>
        </span>
      {/each}
    </div>
  </div>

  <!-- Backstory -->
  <div class="form-control">
    <label class="label">Backstory</label>
    <RichTextEditor bind:content={agent.backstory} />
  </div>

  <div class="modal-action">
    <button type="button" class="btn" on:click={() => dispatch('cancel')}>Cancel</button>
    <button type="submit" class="btn btn-primary">Save Agent</button>
  </div>
</form>
{/if}