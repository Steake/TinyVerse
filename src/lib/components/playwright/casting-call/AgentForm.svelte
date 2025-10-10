<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import type { Agent, Skill } from '../../../stores/types';
  import { groupStore } from '../../../stores/groups';
  import { api } from '../../../api';
  import { toastStore } from '../../../stores/toast';
  import RichTextEditor from '../../common/RichTextEditor.svelte';
  import { autofillStore, runGlobalAutofill, applyFields } from '../../../stores/autofill';
  import { promptStore } from '../../../stores/prompts';
  import AutofillButton from '../../common/AutofillButton.svelte';
  import { autofill } from '../../../actions/autofill';
  import { derived, get } from 'svelte/store';

  export let agent: Partial<Agent> = {
    personality_traits: [],
    professional_interests: [],
    personal_interests: [],
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
  let creatingGroup = false;
  let previousGroup: string | undefined = agent.group ?? undefined;
  let selectedGroup = agent.group ?? '';
  let mounted = false;
  let isAutofilling = false;
  // Seed used by per-field autofill buttons
  let seed: Record<string, unknown> = {};
  let agentAutofillPrompt = '';
  let agentPromptTouched = false;
  const lastAgentResult = derived(autofillStore, ($s) => $s.lastResults.agent);
  $: metadataEntries = (() => {
    const payload = $lastAgentResult;
    if (!payload || typeof payload !== 'object') return [] as Array<[string, unknown]>;
    const meta = (payload as any).metadata ?? (payload as any).meta;
    if (!meta || typeof meta !== 'object') return [] as Array<[string, unknown]>;
    return Object.entries(meta as Record<string, unknown>);
  })();

  function prettifyLabel(label: string): string {
    return label
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function renderMetadataValue(value: unknown): string {
    if (Array.isArray(value)) {
      return value
        .map((item) => (typeof item === 'string' ? item : JSON.stringify(item)))
        .join(', ');
    }
    if (value && typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    if (value === null || value === undefined || value === '') {
      return '—';
    }
    return String(value);
  }

  onMount(() => {
    mounted = true;
  });

  // Keep seed in sync with current agent state
  $: seed = buildSeedPayload();
  $: if (!creatingGroup) {
    selectedGroup = agent.group ?? '';
    previousGroup = agent.group ?? undefined;
  }

  $: baseAgentPrompt = agent.occupation
    ? `Persona for ${agent.occupation}`
    : 'Persona details';
  $: defaultAgentPrompt = `${baseAgentPrompt}. Include a rich backstory paragraph as HTML.`;
  $: if (!agentPromptTouched) {
    agentAutofillPrompt = defaultAgentPrompt;
  }

  function buildSeedPayload() {
    return {
      name: agent.name,
      occupation: agent.occupation,
      occupation_description: agent.occupation_description,
      nationality: agent.nationality,
      country_of_residence: agent.country_of_residence,
      personality_traits: agent.personality_traits,
      professional_interests: agent.professional_interests,
      personal_interests: agent.personal_interests,
      backstory: agent.backstory,
    };
  }

  const getFirst = (value: unknown) => Array.isArray(value) ? value[0] : value;

  function coerceString(value: unknown, fallback = '') {
    if (typeof value === 'string') return value;
    if (value === undefined || value === null) return fallback;
    return String(value);
  }

  function handleNameAutofill(value: unknown) {
    agent.name = coerceString(value, agent.name ?? '');
  }

  function handleAgeAutofill(value: unknown) {
    const candidate = Number(getFirst(value));
    if (Number.isFinite(candidate)) {
      agent.age = Math.max(0, Math.round(candidate));
    }
  }

  function handleNationalityAutofill(value: unknown) {
    agent.nationality = coerceString(value, agent.nationality ?? '');
  }

  function handleResidenceAutofill(value: unknown) {
    agent.country_of_residence = coerceString(value, agent.country_of_residence ?? '');
  }

  function handleOccupationAutofill(value: unknown) {
    agent.occupation = coerceString(value, agent.occupation ?? '');
  }

  function handleOccupationDescriptionAutofill(value: unknown) {
    agent.occupation_description = coerceString(value, agent.occupation_description ?? '');
  }

  function handleNewTraitAutofill(value: unknown) {
    const candidate = getFirst(value);
    newTrait = coerceString(candidate, newTrait);
  }

  function handleProfessionalInterestAutofill(value: unknown) {
    const candidate = getFirst(value);
    newProfessionalInterest = coerceString(candidate, newProfessionalInterest);
  }

  function handlePersonalInterestAutofill(value: unknown) {
    const candidate = getFirst(value);
    newPersonalInterest = coerceString(candidate, newPersonalInterest);
  }

  function handleSkillNameAutofill(value: unknown) {
    if (Array.isArray(value) && value.length > 0) {
      const first = value[0];
      if (first && typeof first === 'object' && 'name' in first) {
        newSkill.name = coerceString((first as Record<string, unknown>).name, newSkill.name);
        return;
      }
      newSkill.name = coerceString(first, newSkill.name);
      return;
    }
    newSkill.name = coerceString(value, newSkill.name);
  }

  function handleSkillLevelAutofill(value: unknown) {
    const candidate = Number(getFirst(value));
    if (Number.isFinite(candidate)) {
      const clamped = Math.min(5, Math.max(1, Math.round(candidate)));
      newSkill.level = clamped;
    }
  }

  async function autofillAgent() {
    try {
      isAutofilling = true;
      const seed = buildSeedPayload();
      // If user provided a top-level prompt, use the global pipeline; else fall back to API call
  const hasGlobal = get(promptStore).master.prompt.trim().length > 0;
      let payload: any;
      if (hasGlobal) {
        const response = await runGlobalAutofill('agent', seed);
        payload = Array.isArray(response) ? response[0] : response;
      } else {
        const context = agentAutofillPrompt.trim() || defaultAgentPrompt;
        const response = await api.autofill({ form: 'agent', context, seed });
        payload = response.data;
      }

      if (payload) {
        if (!hasGlobal) {
          autofillStore.update((state) => ({
            ...state,
            lastResults: { ...state.lastResults, agent: payload }
          }));
        }
        agent = applyFields(agent as any, 'agent', payload) as typeof agent;
        agent = {
          ...agent,
          id: agent.id,
          routines: agent.routines || [],
          relationships: agent.relationships || [],
          emoji: agent.emoji || '👤',
        };
        toastStore.success('Filled agent fields using the simulation LLM');
      }
    } catch (error) {
      console.error('Failed to autofill agent:', error);
      toastStore.error('Autofill failed');
    } finally {
      isAutofilling = false;
    }
  }

  function addTrait() {
    if (newTrait) {
      agent.personality_traits = [...(agent.personality_traits || []), newTrait];
      newTrait = '';
    }
  }

  function removeTrait(trait: string) {
    agent.personality_traits = agent.personality_traits?.filter(t => t !== trait);
  }

  function addInterest(type: 'personal' | 'professional') {
    const interest = type === 'personal' ? newPersonalInterest : newProfessionalInterest;
    if (interest) {
      if (type === 'personal') {
        agent.personal_interests = [...(agent.personal_interests || []), interest];
        newPersonalInterest = '';
      } else {
        agent.professional_interests = [...(agent.professional_interests || []), interest];
        newProfessionalInterest = '';
      }
    }
  }

  function removeInterest(interest: string, type: 'personal' | 'professional') {
    if (type === 'personal') {
      agent.personal_interests = agent.personal_interests?.filter(i => i !== interest);
    } else {
      agent.professional_interests = agent.professional_interests?.filter(i => i !== interest);
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

  function handleGroupSelect(event: Event) {
    const element = event.currentTarget as HTMLSelectElement | null;
    const value = element?.value ?? '';

    if (value === 'new') {
      previousGroup = agent.group ?? undefined;
      creatingGroup = true;
      newGroupName = '';
      selectedGroup = '';
      agent.group = undefined;
      return;
    }

    creatingGroup = false;
    const normalized = value === '' ? undefined : value;
    agent.group = normalized;
    previousGroup = normalized;
    selectedGroup = value;
  }

  function handleGroupNameKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleCreateGroup();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancelGroupCreation();
    }
  }

  function cancelGroupCreation() {
    creatingGroup = false;
    newGroupName = '';
    agent.group = previousGroup;
    selectedGroup = previousGroup ?? '';
  }

  function handleCreateGroup() {
    const name = newGroupName.trim();
    if (!name) return;

    const groupId = crypto.randomUUID();
    groupStore.addGroup({
      id: groupId,
      name
    });
    agent.group = groupId;
    previousGroup = groupId;
    selectedGroup = groupId;
    newGroupName = '';
    creatingGroup = false;
  }

  function handleSubmit() {
    const completeAgent: Agent = {
      id: agent.id || crypto.randomUUID(),
      name: agent.name || '',
      age: agent.age || 25,
      occupation: agent.occupation || '',
      occupation_description: agent.occupation_description || '',
      nationality: agent.nationality || '',
      country_of_residence: agent.country_of_residence || '',
      routines: agent.routines || [],
      personality_traits: agent.personality_traits || [],
      professional_interests: agent.professional_interests || [],
      personal_interests: agent.personal_interests || [],
      skills: agent.skills || [],
      relationships: agent.relationships || [],
      backstory: agent.backstory || '',
      emoji: agent.emoji || '👤',
      profilePicture: agent.profilePicture,
      group: agent.group
    };

    dispatch('save', completeAgent);
  }

  function handleAgentPromptInput(event: Event) {
    agentAutofillPrompt = (event.target as HTMLTextAreaElement).value;
    agentPromptTouched = true;
  }

  function resetAgentPrompt() {
    agentPromptTouched = false;
    agentAutofillPrompt = defaultAgentPrompt;
  }
</script>

{#if mounted}
<form on:submit|preventDefault={handleSubmit} class="space-y-6">
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <h3 class="text-lg font-semibold">
      {agent.id ? 'Agent Details' : 'New Agent Profile'}
    </h3>
    <div class="flex items-center gap-2">
      <button
        type="button"
        class="btn btn-outline btn-sm"
        on:click={autofillAgent}
        disabled={isAutofilling}
      >
        {isAutofilling ? 'Generating…' : 'Autofill with LLM'}
      </button>
      <button type="button" class="btn btn-ghost btn-sm" on:click={() => dispatch('cancel')}>
        ← Back
      </button>
    </div>
  </div>

  {#if metadataEntries.length}
    <div class="agent-metadata" role="region" aria-label="Latest agent metadata">
      <header>
        <strong>Latest agent metadata</strong>
        <span class="hint">Refreshed from the global blueprint.</span>
      </header>
      <dl>
        {#each metadataEntries as [key, value]}
          <div>
            <dt>{prettifyLabel(key)}</dt>
            <dd>{renderMetadataValue(value)}</dd>
          </div>
        {/each}
      </dl>
    </div>
  {/if}

  <div class="form-control">
    <label class="label" for="agent-autofill-prompt">
      <span class="label-text">Autofill prompt</span>
      <span class="label-text-alt">Used when no global prompt is set</span>
    </label>
    <textarea
      id="agent-autofill-prompt"
      class="textarea textarea-bordered"
      rows="3"
      bind:value={agentAutofillPrompt}
      on:input={handleAgentPromptInput}
      placeholder="Describe the persona to generate rich agent details"
    />
    <div class="label" role="note">
      <span class="label-text-alt">Defaults update as you edit occupation details.</span>
      <button type="button" class="btn btn-ghost btn-xs" on:click={resetAgentPrompt}>Reset</button>
    </div>
  </div>

  <div class="grid grid-cols-2 gap-4">
    <div class="form-control">
      <label class="label" for="name">Name</label>
      <input
        type="text"
        id="name"
        bind:value={agent.name}
        class="input input-bordered"
        required
        use:autofill={{
          scope: 'agent',
          field: 'name',
          seed: () => agent,
          onValue: handleNameAutofill
        }}
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
        use:autofill={{
          scope: 'agent',
          field: 'age',
          seed: () => agent,
          onValue: handleAgeAutofill
        }}
      />
    </div>
  </div>

  <div class="form-control">
    <label class="label" for="group">Group</label>
    <div class="join w-full">
      {#if creatingGroup}
        <input
          type="text"
          class="input input-bordered join-item w-full"
          bind:value={newGroupName}
          placeholder="New group name"
          on:keydown={handleGroupNameKeydown}
          autofocus
        />
        <button
          type="button"
          class="btn btn-primary join-item"
          on:click={handleCreateGroup}
          disabled={!newGroupName.trim()}
        >
          Create
        </button>
        <button
          type="button"
          class="btn btn-ghost join-item"
          on:click={cancelGroupCreation}
        >
          Cancel
        </button>
      {:else}
        <select
          id="group"
          class="select select-bordered join-item w-full"
          bind:value={selectedGroup}
          on:change={handleGroupSelect}
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
        use:autofill={{
          scope: 'agent',
          field: 'nationality',
          seed: () => agent,
          onValue: handleNationalityAutofill
        }}
      />
    </div>

    <div class="form-control">
      <label class="label" for="residence">Country of Residence</label>
      <input
        type="text"
        id="residence"
        bind:value={agent.country_of_residence}
        class="input input-bordered"
        required
        use:autofill={{
          scope: 'agent',
          field: 'country_of_residence',
          seed: () => agent,
          onValue: handleResidenceAutofill
        }}
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
      use:autofill={{
        scope: 'agent',
        field: 'occupation',
        seed: () => agent,
        onValue: handleOccupationAutofill
      }}
    />
  </div>

  <div class="form-control">
    <label class="label" for="occupation_description">Occupation Description</label>
    <textarea
      id="occupation_description"
      bind:value={agent.occupation_description}
      class="textarea textarea-bordered"
      rows="3"
      use:autofill={{
        scope: 'agent',
        field: 'occupation_description',
        seed: () => agent,
        onValue: handleOccupationDescriptionAutofill
      }}
    />
  </div>

  <!-- Personality Traits -->
  <div class="form-control">
    <label class="label" for="traitInput">Personality Traits</label>
    <div class="flex gap-2">
      <div class="flex-1">
        <input
          id="traitInput"
          type="text"
          bind:value={newTrait}
          class="input input-bordered w-full"
          placeholder="Add a trait"
          use:autofill={{
            scope: 'agent',
            field: 'personality_traits',
            seed: () => agent,
            onValue: handleNewTraitAutofill
          }}
        />
      </div>
      <button type="button" class="btn btn-primary" on:click={addTrait}>Add</button>
    </div>
    <div class="flex flex-wrap gap-2 mt-2">
      {#each agent.personality_traits || [] as trait}
        <span class="badge badge-primary gap-2">
          {trait}
          <button type="button" class="btn btn-ghost btn-xs" on:click={() => removeTrait(trait)}>×</button>
        </span>
      {/each}
    </div>
  </div>

  <!-- Professional Interests -->
  <div class="form-control">
    <label class="label" for="profInterestInput">Professional Interests</label>
    <div class="flex gap-2">
      <div class="flex-1">
        <input
          id="profInterestInput"
          type="text"
          bind:value={newProfessionalInterest}
          class="input input-bordered w-full"
          placeholder="Add a professional interest"
          use:autofill={{
            scope: 'agent',
            field: 'professional_interests',
            seed: () => agent,
            onValue: handleProfessionalInterestAutofill
          }}
        />
      </div>
      <button type="button" class="btn btn-primary" on:click={() => addInterest('professional')}>Add</button>
    </div>
    <div class="flex flex-wrap gap-2 mt-2">
      {#each agent.professional_interests || [] as interest}
        <span class="badge badge-secondary gap-2">
          {interest}
          <button type="button" class="btn btn-ghost btn-xs" on:click={() => removeInterest(interest, 'professional')}>×</button>
        </span>
      {/each}
    </div>
  </div>

  <!-- Personal Interests -->
  <div class="form-control">
    <label class="label" for="personalInterestInput">Personal Interests</label>
    <div class="flex gap-2">
      <div class="flex-1">
        <input
          id="personalInterestInput"
          type="text"
          bind:value={newPersonalInterest}
          class="input input-bordered w-full"
          placeholder="Add a personal interest"
          use:autofill={{
            scope: 'agent',
            field: 'personal_interests',
            seed: () => agent,
            onValue: handlePersonalInterestAutofill
          }}
        />
      </div>
      <button type="button" class="btn btn-primary" on:click={() => addInterest('personal')}>Add</button>
    </div>
    <div class="flex flex-wrap gap-2 mt-2">
      {#each agent.personal_interests || [] as interest}
        <span class="badge badge-accent gap-2">
          {interest}
          <button type="button" class="btn btn-ghost btn-xs" on:click={() => removeInterest(interest, 'personal')}>×</button>
        </span>
      {/each}
    </div>
  </div>

  <!-- Skills -->
  <div class="form-control">
    <label class="label" for="skillNameInput">Skills</label>
    <div class="flex flex-wrap items-start gap-2">
      <div class="flex-1 min-w-[200px]">
        <input
          id="skillNameInput"
          type="text"
          bind:value={newSkill.name}
          class="input input-bordered w-full"
          placeholder="Skill name"
          use:autofill={{
            scope: 'agent',
            field: 'skills',
            seed: () => agent,
            onValue: handleSkillNameAutofill
          }}
        />
      </div>
      <div class="flex flex-col items-center gap-1">
        <input
          id="skillLevelRange"
          type="range"
          bind:value={newSkill.level}
          min="1"
          max="5"
          class="range range-primary w-32"
          use:autofill={{
            scope: 'agent',
            field: 'skill_level',
            seed: () => agent,
            onValue: handleSkillLevelAutofill,
            hint: 'Scale from 1 (novice) to 5 (expert).'
          }}
        />
        <span class="w-12 text-center text-sm" id="skillLevelValue">Level {newSkill.level}</span>
      </div>
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
    <label class="label" for="backstoryEditor">Backstory</label>
    <AutofillButton scope="agent" field="backstory" {seed} onValue={(v) => agent.backstory = String(v)} title="Autofill backstory" />
    <div id="backstoryEditor" aria-label="Backstory">
      <RichTextEditor bind:content={agent.backstory} />
    </div>
  </div>

  <div class="modal-action">
    <button type="button" class="btn" on:click={() => dispatch('cancel')}>Cancel</button>
    <button type="submit" class="btn btn-primary">Save Agent</button>
  </div>
</form>
{/if}

<style>
  .agent-metadata {
    margin-top: 1rem;
    padding: 1rem;
    border: 1px solid var(--color-border-subtle);
    border-radius: 12px;
    background: var(--color-bg-elevated, rgba(15, 23, 42, 0.45));
  }

  .agent-metadata header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .agent-metadata .hint {
    font-size: 0.75rem;
    color: var(--color-text-tertiary);
  }

  .agent-metadata dl {
    display: grid;
    grid-template-columns: minmax(120px, 180px) 1fr;
    gap: 0.35rem 1rem;
    font-size: 0.85rem;
  }

  .agent-metadata dt {
    font-weight: 600;
    color: var(--color-text-secondary);
  }

  .agent-metadata dd {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    color: var(--color-text-primary);
  }
</style>
