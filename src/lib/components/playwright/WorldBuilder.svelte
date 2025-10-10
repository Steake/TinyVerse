<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '../../api';
  import { worldStore } from '../../stores/world';
  import { agentStore } from '../../stores/agents';
  import { toastStore } from '../../stores/toast';
  import { loadingStore } from '../../stores/loading';
  import type { Location } from '../../stores/world';
  import type { Agent, Relationship } from '../../stores/agents';
  import { autofill } from '../../actions/autofill';
  import { autofillStore, runGlobalAutofill, applyFields } from '../../stores/autofill';
  import { promptStore } from '../../stores/prompts';
  import { get } from 'svelte/store';

  type CallCenterAgentSeed = {
    key: string;
    definition: Omit<Agent, 'id' | 'created_at'>;
  };

  const callCenterLocations: Array<Omit<Location, 'id'>> = [
    {
      name: 'Boiler Room Pit',
      type: 'room',
      description: 'Windowless pit where dialers spray high-pressure penny stock scripts at prospects.',
      x: 110,
      y: 90,
      width: 180,
      height: 120,
    },
    {
      name: 'War Room',
      type: 'room',
      description: 'Lieutenants choreograph squeeze tactics and track the hottest marks in real time.',
      x: 340,
      y: 140,
      width: 140,
      height: 115,
    },
    {
      name: 'Wire Ops Nook',
      type: 'room',
      description: 'Money mule staging corner prepping forged contracts and same-day transfers.',
      x: 530,
      y: 110,
      width: 130,
      height: 110,
    },
    {
      name: 'Victim Scoreboard',
      type: 'special',
      description: 'Screens ranking targets by net worth, desperation level, and conversion probability.',
      x: 260,
      y: 320,
      width: 230,
      height: 160,
    },
  ];

  const callCenterAgents: CallCenterAgentSeed[] = [
    {
      key: 'dialer_max',
      definition: {
        name: 'Max "Mad Dog" Russo',
        age: 31,
        occupation: 'Lead Dialer',
        occupation_description: 'High-octane opener who detonates urgency and fear of missing out in seconds.',
        nationality: 'USA',
        country_of_residence: 'USA',
        personality_traits: ['predatory', 'relentless', 'loud'],
        professional_interests: ['cold calling', 'penny stocks'],
        personal_interests: ['mma sparring', 'luxury watches'],
        skills: [
          { name: 'high_pressure_openers', level: 9 },
          { name: 'objection_blitzing', level: 9 },
          { name: 'victim_qualification', level: 8 },
        ],
        routines: [],
        relationships: [],
        backstory: 'Cut his teeth in shady brokerage houses; thrives on adrenaline fueled call blitzes.',
        emoji: '�',
      },
    },
    {
      key: 'opener_sonia',
      definition: {
        name: 'Sonia "Silver Tongue" Patel',
        age: 29,
        occupation: 'Senior Opener',
        occupation_description: 'Builds synthetic trust before dumping prospects into the squeeze pipeline.',
        nationality: 'USA',
        country_of_residence: 'USA',
        personality_traits: ['charismatic', 'calculating', 'observant'],
        professional_interests: ['persona mapping', 'social engineering'],
        personal_interests: ['psych thrillers', 'craft cocktails'],
        skills: [
          { name: 'rapport_manufacturing', level: 10 },
          { name: 'accent_shifting', level: 8 },
          { name: 'urgency_framing', level: 9 },
        ],
        routines: [],
        relationships: [],
        backstory: 'Built a dossier library of hooks tailored to every archetype on the scoreboard.',
        emoji: '🪄',
      },
    },
    {
      key: 'closer_victor',
      definition: {
        name: 'Victor "The Hammer" Klein',
        age: 44,
        occupation: 'Shutdown Closer',
        occupation_description: 'Applies suffocating pressure until victims wire funds or hang up.',
        nationality: 'USA',
        country_of_residence: 'USA',
        personality_traits: ['domineering', 'threatening', 'methodical'],
        professional_interests: ['deal squeezing', 'psych leverage'],
        personal_interests: ['powerlifting', 'cigar clubs'],
        skills: [
          { name: 'squeeze_closing', level: 10 },
          { name: 'threat_escalation', level: 9 },
          { name: 'contract_spinning', level: 8 },
        ],
        routines: [],
        relationships: [],
        backstory: 'Expelled broker who rebranded in the shadows; legendary for 6-figure same-day wires.',
        emoji: '🦈',
      },
    },
    {
      key: 'script_lila',
      definition: {
        name: 'Lila Monroe',
        age: 36,
        occupation: 'Narrative Architect',
        occupation_description: 'Writes lethal call scripts and calibrates emotional triggers in real time.',
        nationality: 'USA',
        country_of_residence: 'USA',
        personality_traits: ['creative', 'cynical', 'fast-thinking'],
        professional_interests: ['storyboarding cons', 'market manipulation'],
        personal_interests: ['noir cinema', 'data viz'],
        skills: [
          { name: 'script_design', level: 9 },
          { name: 'trigger_mapping', level: 8 },
          { name: 'counter_regulation', level: 7 },
        ],
        routines: [],
        relationships: [],
        backstory: 'Former ad copy prodigy who pivoted to writing lies that convert under pressure.',
        emoji: '📝',
      },
    },
    {
      key: 'wire_gus',
      definition: {
        name: 'Gus Navarro',
        age: 41,
        occupation: 'Wire Facilitator',
        occupation_description: 'Coordinates burner accounts and fake escrow to vacuum funds instantly.',
        nationality: 'USA',
        country_of_residence: 'USA',
        personality_traits: ['paranoid', 'meticulous', 'secretive'],
        professional_interests: ['money movement', 'shell companies'],
        personal_interests: ['urban exploration', 'lock picking'],
        skills: [
          { name: 'wire_funneling', level: 9 },
          { name: 'document_forgery', level: 8 },
          { name: 'risk_triage', level: 7 },
        ],
        routines: [],
        relationships: [],
        backstory: 'Ex-compliance analyst turned fixer who launders the take through layered fronts.',
        emoji: '�',
      },
    },
    {
      key: 'compliance_dana',
      definition: {
        name: 'Dana Pierce',
        age: 39,
        occupation: 'Token Compliance Officer',
        occupation_description: 'Maintains the spreadsheet façade of legitimacy and scripts rebuttals.',
        nationality: 'USA',
        country_of_residence: 'USA',
        personality_traits: ['calculating', 'risk-aware', 'cynical'],
        professional_interests: ['regulatory loopholes', 'paper trails'],
        personal_interests: ['corporate law dramas', 'yoga'],
        skills: [
          { name: 'plausible_deniability', level: 9 },
          { name: 'audit_spin', level: 8 },
          { name: 'policy_fabrication', level: 7 },
        ],
        routines: [],
        relationships: [],
        backstory: 'Keeps just enough documentation to gaslight auditors while enabling the rip.',
        emoji: '�️',
      },
    },
    {
      key: 'target_evan',
      definition: {
        name: 'Evan Bradley',
        age: 57,
        occupation: 'Retired Investor',
        occupation_description: 'Recently cashed-out trader hunting yield, susceptible to fear-of-missing-out pitches.',
        nationality: 'USA',
        country_of_residence: 'USA',
        personality_traits: ['status-conscious', 'impatient', 'credulous'],
        professional_interests: ['yield hunting', 'emerging markets'],
        personal_interests: ['golf', 'wine collecting'],
        skills: [
          { name: 'portfolio_management', level: 6 },
          { name: 'risk_assessment', level: 4 },
        ],
        routines: [],
        relationships: [],
        backstory: 'Chasing a comeback win after retiring early; still addicted to fast-moving bets.',
        emoji: '�',
      },
    },
  ];

  const callCenterRelationships: Array<{
    source: string;
    target: string;
    relationship_type: string;
    strength: number;
    description: string;
  }> = [
    {
      source: 'dialer_max',
      target: 'closer_victor',
      relationship_type: 'funnels_to',
      strength: 85,
      description: 'Max hands scorched-earth prospects to Victor for the hammer drop.',
    },
    {
      source: 'opener_sonia',
      target: 'closer_victor',
      relationship_type: 'sets_up',
      strength: 82,
      description: 'Sonia softens high-value marks and primes Victor for the squeeze.',
    },
    {
      source: 'script_lila',
      target: 'dialer_max',
      relationship_type: 'feeds_scripts',
      strength: 78,
      description: 'Lila delivers tailored trigger scripts to Max every morning.',
    },
    {
      source: 'script_lila',
      target: 'opener_sonia',
      relationship_type: 'feeds_scripts',
      strength: 74,
      description: 'Lila refines persona hooks for Sonia in real time.',
    },
    {
      source: 'wire_gus',
      target: 'closer_victor',
      relationship_type: 'executes_wires',
      strength: 88,
      description: 'Gus spins up shell accounts once Victor sniffs commitment.',
    },
    {
      source: 'compliance_dana',
      target: 'closer_victor',
      relationship_type: 'covers_for',
      strength: 70,
      description: 'Dana fabricates compliance narratives for Victor’s heat.',
    },
    {
      source: 'closer_victor',
      target: 'target_evan',
      relationship_type: 'pressures',
      strength: 90,
      description: 'Victor escalates fear tactics to pry open Evan’s retirement fund.',
    },
  ];

  type SetupStatus = 'idle' | 'running' | 'complete' | 'warning';
  type SetupSummary = {
    expectedLocations: number;
    expectedAgents: number;
    expectedRelationships: number;
    createdLocations: number;
    createdAgents: number;
    linkedRelationships: number;
    failedLocationCreates: number;
    failedAgentCreates: number;
    failedRelationships: number;
  };

  const setupSummaryTemplate: SetupSummary = {
    expectedLocations: callCenterLocations.length,
    expectedAgents: callCenterAgents.length,
    expectedRelationships: callCenterRelationships.length,
    createdLocations: 0,
    createdAgents: 0,
    linkedRelationships: 0,
    failedLocationCreates: 0,
    failedAgentCreates: 0,
    failedRelationships: 0,
  };

  let setupSummary: SetupSummary = { ...setupSummaryTemplate };
  let setupStatus: SetupStatus = 'idle';
  let setupMessages: string[] = [];
  let isSettingUpScenario = false;

  let clearingWorld = false;
  let isRefreshingState = false;
  let isRunningSteps = false;
  let creatingLocation = false;
  let isAutofillingLocation = false;
  let simulationSteps = 18;
  let lastSyncedAt: string | null = null;
  let lastSetupDurationMs: number | null = null;

  let locationForm: Omit<Location, 'id'> = {
    name: '',
    type: 'room',
    description: '',
    x: 0,
    y: 0,
    width: 120,
    height: 120,
  };
  let locationAutofillPrompt = '';
  let locationPromptTouched = false;

  const formatLocationPrompt = () => {
    const name = locationForm.name?.trim();
    const type = locationForm.type ?? 'room';
    const description = locationForm.description?.trim();
    const segments = [
      name ? `Design a ${type} called "${name}" for the TinyVerse call center.` : 'Call center environment layout.',
      description ? `Incorporate details like: ${description}.` : undefined,
      'Return structured coordinates and concise descriptions.'
    ].filter(Boolean);
    return segments.join(' ');
  };

  $: defaultLocationPrompt = formatLocationPrompt();
  $: if (!locationPromptTouched) {
    locationAutofillPrompt = defaultLocationPrompt;
  }

  const resetSetupSummary = () => {
    setupSummary = { ...setupSummaryTemplate };
  };

  const updateSummary = (partial: Partial<SetupSummary>) => {
    setupSummary = { ...setupSummary, ...partial };
  };

  const markSync = () => {
    const timestamp = new Date().toISOString();
    lastSyncedAt = timestamp;
  };

  async function refreshWorldState(options: { showToast?: boolean } = {}) {
    if (isRefreshingState) return;
    isRefreshingState = true;
    try {
      await Promise.all([worldStore.fetchLocations(), agentStore.fetchAgents()]);
      markSync();
      if (options.showToast) {
        toastStore.success('World state refreshed');
      }
    } catch (error) {
      console.error('Failed to refresh world state', error);
      toastStore.error('Failed to refresh world state');
    } finally {
      isRefreshingState = false;
    }
  }

  async function clearExistingWorld() {
    if (clearingWorld) return;
    clearingWorld = true;
    try {
      const [agentsResponse, locationsResponse] = await Promise.all([
        api.getAgents(),
        api.getLocations(),
      ]);

      if (agentsResponse.data) {
        await Promise.allSettled(agentsResponse.data.map((agent) => api.deleteAgent(agent.id)));
      }

      if (locationsResponse.data) {
        await Promise.allSettled(locationsResponse.data.map((location) => api.deleteLocation(location.id)));
      }

      await refreshWorldState();
      toastStore.info('Cleared existing agents and locations');
    } catch (error) {
      console.error('Failed to reset world state', error);
      toastStore.error('Failed to reset existing world');
      throw error;
    } finally {
      clearingWorld = false;
    }
  }

  async function setupCallCenterScenario() {
    if (isSettingUpScenario) return;
    isSettingUpScenario = true;
    setupStatus = 'running';
    setupMessages = [];
    resetSetupSummary();
    const startedAt = performance.now();

    try {
      await clearExistingWorld();

      let createdLocationCount = 0;
      let failedLocationCount = 0;

      await Promise.all(
        callCenterLocations.map(async (location) => {
          try {
            const response = await api.createLocation(location);
            if (response.data) {
              createdLocationCount += 1;
              updateSummary({ createdLocations: createdLocationCount });
            }
          } catch (error) {
            failedLocationCount += 1;
            updateSummary({ failedLocationCreates: failedLocationCount });
            setupMessages = [
              ...setupMessages,
              `Failed to create location "${location.name}": ${
                error instanceof Error ? error.message : 'Unknown error'
              }`,
            ];
          }
        }),
      );

      const agentIdsBySeed: Record<string, string> = {};
      let createdAgentCount = 0;
      let failedAgentCount = 0;

      await Promise.all(
        callCenterAgents.map(async (seed) => {
          try {
            const response = await api.createAgent(seed.definition);
            if (response.data) {
              agentIdsBySeed[seed.key] = response.data.id;
              createdAgentCount += 1;
              updateSummary({ createdAgents: createdAgentCount });
            }
          } catch (error) {
            failedAgentCount += 1;
            updateSummary({ failedAgentCreates: failedAgentCount });
            setupMessages = [
              ...setupMessages,
              `Failed to create agent "${seed.definition.name}": ${
                error instanceof Error ? error.message : 'Unknown error'
              }`,
            ];
          }
        }),
      );

      let linkedRelationshipCount = 0;
      let failedRelationshipCount = 0;

      await Promise.all(
        callCenterRelationships.map(async (relationship) => {
          const sourceId = agentIdsBySeed[relationship.source];
          const targetId = agentIdsBySeed[relationship.target];

          if (!sourceId || !targetId) {
            failedRelationshipCount += 1;
            updateSummary({ failedRelationships: failedRelationshipCount });
            setupMessages = [
              ...setupMessages,
              `Skipped relationship ${relationship.source} → ${relationship.target} due to missing agent`,
            ];
            return;
          }

          try {
            await api.addRelationship(sourceId, {
              targetId,
              type: relationship.relationship_type as Relationship['type'],
              strength: relationship.strength,
              description: relationship.description,
            });
            linkedRelationshipCount += 1;
            updateSummary({ linkedRelationships: linkedRelationshipCount });
          } catch (error) {
            failedRelationshipCount += 1;
            updateSummary({ failedRelationships: failedRelationshipCount });
            setupMessages = [
              ...setupMessages,
              `Failed to link ${relationship.source} → ${relationship.target}: ${
                error instanceof Error ? error.message : 'Unknown error'
              }`,
            ];
          }
        }),
      );

      await refreshWorldState();
      lastSetupDurationMs = performance.now() - startedAt;

      setupStatus = setupMessages.length > 0 ? 'warning' : 'complete';
      if (setupStatus === 'warning') {
        toastStore.warning('Call center seeded with warnings');
      } else {
        toastStore.success('Call center scenario ready');
      }
    } catch (error) {
      console.error('Failed to seed call center scenario', error);
      toastStore.error('Failed to set up call center scenario');
      setupStatus = 'warning';
      setupMessages = [
        ...setupMessages,
        `Scenario setup aborted: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ];
    } finally {
      isSettingUpScenario = false;
    }
  }

  async function handleCreateLocation() {
    if (creatingLocation) return;
    if (!locationForm.name.trim()) {
      toastStore.error('Location name is required');
      return;
    }
    creatingLocation = true;
    try {
      const response = await worldStore.addLocation({ ...locationForm });
      if (response) {
        toastStore.success(`Location "${response.name}" created`);
        locationForm = {
          name: '',
          type: 'room',
          description: '',
          x: 0,
          y: 0,
          width: 120,
          height: 120,
        };
        locationPromptTouched = false;
      }
    } catch (error) {
      console.error('Failed to create location', error);
      toastStore.error('Failed to create location');
    } finally {
      creatingLocation = false;
    }
  }

  function handleLocationPromptInput(event: Event) {
    locationAutofillPrompt = (event.target as HTMLTextAreaElement).value;
    locationPromptTouched = true;
  }

  function resetLocationPrompt() {
    locationPromptTouched = false;
    locationAutofillPrompt = defaultLocationPrompt;
  }

  async function autofillLocation() {
    if (isAutofillingLocation) return;
    isAutofillingLocation = true;
    try {
  const seed = { ...locationForm };
  const hasGlobal = get(promptStore).master.prompt.trim().length > 0;
      let payload: any;
      if (hasGlobal) {
        payload = await runGlobalAutofill('location', seed);
      } else {
        const context = locationAutofillPrompt.trim() || defaultLocationPrompt;
        const response = await api.autofill({ form: 'location', context, seed });
        payload = response.data;
      }

      if (payload) {
        locationForm = applyFields(locationForm as any, 'location', payload) as typeof locationForm;
        toastStore.success('Location fields auto-filled');
      }
    } catch (error) {
      console.error('Failed to autofill location', error);
      toastStore.error('Location autofill failed');
    } finally {
      isAutofillingLocation = false;
    }
  }

  async function startSimulation() {
    try {
      await api.controlSimulation('start');
      toastStore.info('Simulation started');
    } catch (error) {
      console.error('Failed to start simulation', error);
      toastStore.error('Failed to start simulation');
    }
  }

  async function pauseSimulation() {
    try {
      await api.controlSimulation('pause');
      toastStore.info('Simulation paused');
    } catch (error) {
      console.error('Failed to pause simulation', error);
      toastStore.error('Failed to pause simulation');
    }
  }

  async function stopSimulation() {
    try {
      await api.controlSimulation('stop');
      toastStore.success('Simulation stopped');
    } catch (error) {
      console.error('Failed to stop simulation', error);
      toastStore.error('Failed to stop simulation');
    }
  }

  async function runSimulationSteps() {
    if (isRunningSteps) return;
    if (simulationSteps < 1) {
      toastStore.error('Simulation steps must be at least 1');
      return;
    }

    isRunningSteps = true;
    try {
      await api.controlSimulation('start');
      for (let index = 0; index < simulationSteps; index += 1) {
        await api.controlSimulation('step', 1);
      }
      toastStore.success(`Ran ${simulationSteps} simulation step${simulationSteps === 1 ? '' : 's'}`);
    } catch (error) {
      console.error('Failed to run simulation steps', error);
      toastStore.error('Failed to execute simulation steps');
    } finally {
      isRunningSteps = false;
    }
  }

  onMount(async () => {
    loadingStore.start('world:initial-load');
    try {
      await refreshWorldState();
    } finally {
      loadingStore.stop('world:initial-load');
    }
  });

  $: worldState = $worldStore;
  $: agentState = $agentStore;
  $: locations = worldState?.locations ?? [];
  $: agents = Array.isArray(agentState) ? agentState : [];
  $: locationCount = locations.length;
  $: agentCount = agents.length;
  $: formattedLastSync = lastSyncedAt ? new Date(lastSyncedAt).toISOString() : 'Never';
  $: formattedSetupDuration =
    lastSetupDurationMs !== null ? `${Math.round(lastSetupDurationMs / 100) / 10}s` : '—';

  type LocationType = 'room' | 'outdoor' | 'special';
  const allowedLocationTypes: readonly LocationType[] = ['room', 'outdoor', 'special'];
  const makeNumericHandler = (setter: (value: number) => void) => (value: unknown) => {
    const n = Number(value);
    if (Number.isFinite(n)) {
      setter(n);
    }
  };

  function handleLocationTypeAutofill(value: unknown) {
    const suggestion = String(value ?? '').toLowerCase();
    if (allowedLocationTypes.includes(suggestion as LocationType)) {
      locationForm.type = suggestion as LocationType;
    }
  }
</script>

<main data-testid="world-builder">
  <header>
    <h2>World Builder</h2>
    <p class="text-secondary">
      Configure the call center simulation directly from the interface. Use the quick setup to seed the
      environment, add extra locations manually, and drive simulation steps without leaving the UI.
    </p>
  </header>

  <section class="card">
    <div class="card-header">
      <div>
        <h3 class="card-title">Call Center Quick Setup</h3>
        <p class="text-sm text-secondary">
          Seeds the canonical TinyVerse call center: locations, frontline telequestioners, closers, compliance,
          and customer personas. Existing entities are cleared before provisioning.
        </p>
      </div>
      <div class="flex gap-sm">
        <button
          class="btn-secondary btn-sm"
          on:click={clearExistingWorld}
          disabled={clearingWorld || isSettingUpScenario}
          data-testid="clear-world-button"
        >
          {#if clearingWorld}
            <span class="loading"></span>
            Resetting…
          {:else}
            Reset World
          {/if}
        </button>
        <button
          class="btn-secondary btn-sm"
          on:click={() => refreshWorldState({ showToast: true })}
          disabled={isRefreshingState}
          data-testid="refresh-world-state"
        >
          {#if isRefreshingState}
            <span class="loading"></span>
            Syncing…
          {:else}
            Sync State
          {/if}
        </button>
        <button
          class="btn-primary btn-sm"
          on:click={setupCallCenterScenario}
          disabled={isSettingUpScenario || clearingWorld}
          data-testid="call-center-quick-setup"
        >
          {#if isSettingUpScenario}
            <span class="loading"></span>
            Seeding…
          {:else}
            Seed Call Center
          {/if}
        </button>
      </div>
    </div>

    <div class="card-body">
      <ul data-layout="grid">
        <li class="card p-md" style="background-color: var(--color-bg-tertiary);">
          <h4 class="font-semibold mb-sm">Locations ({locationCount})</h4>
          <ul class="flex-col gap-sm overflow-y-auto" style="max-height: 12rem;" data-testid="location-list">
            {#if locationCount === 0}
              <li class="text-sm" style="color: var(--color-text-tertiary);">No locations configured yet.</li>
            {:else}
              {#each locations as location (location.id)}
                <li class="text-sm">
                  <span class="font-medium">{location.name}</span>
                  <span style="color: var(--color-text-secondary);"> — {location.type}</span>
                </li>
              {/each}
            {/if}
          </ul>
        </li>
        <li class="card p-md" style="background-color: var(--color-bg-tertiary);">
          <h4 class="font-semibold mb-sm">Agents ({agentCount})</h4>
          <ul class="flex-col gap-sm overflow-y-auto" style="max-height: 12rem;" data-testid="agent-list">
            {#if agentCount === 0}
              <li class="text-sm" style="color: var(--color-text-tertiary);">No agents available yet.</li>
            {:else}
              {#each agents as agent (agent.id)}
                <li class="text-sm">
                  <span class="font-medium">{agent.name}</span>
                  <span style="color: var(--color-text-secondary);"> — {agent.occupation}</span>
                </li>
              {/each}
            {/if}
          </ul>
        </li>
      </ul>
    </div>
  </section>

  <section class="card" data-testid="call-center-summary">
    <div class="card-header">
      <h3 class="card-title">Scenario Snapshot</h3>
    </div>
    <div class="card-body">
      <ul data-layout="grid">
        <li class="card p-md" style="background-color: var(--color-bg-tertiary);">
          <div class="text-sm mb-xs" style="color: var(--color-text-secondary);">Locations</div>
          <div class="text-4xl font-semibold mb-xs" data-testid="summary-location-count">{locationCount}</div>
          <div class="text-sm" style="color: var(--color-text-tertiary);">Target {setupSummary.expectedLocations}</div>
        </li>
        <li class="card p-md" style="background-color: var(--color-bg-tertiary);">
          <div class="text-sm mb-xs" style="color: var(--color-text-secondary);">Agents</div>
          <div class="text-4xl font-semibold mb-xs" data-testid="summary-agent-count">{agentCount}</div>
          <div class="text-sm" style="color: var(--color-text-tertiary);">Target {setupSummary.expectedAgents}</div>
        </li>
        <li class="card p-md" style="background-color: var(--color-bg-tertiary);">
          <div class="text-sm mb-xs" style="color: var(--color-text-secondary);">Last Sync</div>
          <div class="text-xl font-semibold mb-xs" data-testid="summary-last-sync">{formattedLastSync}</div>
          <div class="text-sm" style="color: var(--color-text-tertiary);">Setup elapsed {formattedSetupDuration}</div>
        </li>
      </ul>
    </div>
  </section>

  <section class="card" data-testid="call-center-setup-details">
    <div class="card-header">
      <div>
        <h3 class="card-title">Setup Diagnostics</h3>
        <p class="text-sm text-secondary">Track provisioning progress and any warnings returned by TinyTroupe.</p>
      </div>
      <span
        class={`badge ${
          setupStatus === 'running'
            ? 'badge-info'
            : setupStatus === 'complete'
            ? 'badge-success'
            : setupStatus === 'warning'
            ? 'badge-warning'
            : 'badge-neutral'
        }`}
        data-testid="setup-status-badge"
      >
        {#if setupStatus === 'running'}
          Seeding…
        {:else if setupStatus === 'complete'}
          Complete
        {:else if setupStatus === 'warning'}
          Needs Attention
        {:else}
          Idle
        {/if}
      </span>
    </div>
    <div class="card-body">
      <ul data-layout="grid">
        <li class="card p-md" style="background-color: var(--color-bg-tertiary);">
          <div class="text-sm mb-xs" style="color: var(--color-text-secondary);">Locations</div>
          <div class="text-2xl font-semibold mb-xs" data-testid="setup-locations-progress">
            {setupSummary.createdLocations}/{setupSummary.expectedLocations}
          </div>
          {#if setupSummary.failedLocationCreates > 0}
            <div class="text-sm" style="color: var(--color-accent-danger);">{setupSummary.failedLocationCreates} failed</div>
          {/if}
        </li>
        <li class="card p-md" style="background-color: var(--color-bg-tertiary);">
          <div class="text-sm mb-xs" style="color: var(--color-text-secondary);">Agents</div>
          <div class="text-2xl font-semibold mb-xs" data-testid="setup-agents-progress">
            {setupSummary.createdAgents}/{setupSummary.expectedAgents}
          </div>
          {#if setupSummary.failedAgentCreates > 0}
            <div class="text-sm" style="color: var(--color-accent-danger);">{setupSummary.failedAgentCreates} failed</div>
          {/if}
        </li>
        <li class="card p-md" style="background-color: var(--color-bg-tertiary);">
          <div class="text-sm mb-xs" style="color: var(--color-text-secondary);">Relationships</div>
          <div class="text-2xl font-semibold mb-xs" data-testid="setup-relationships-progress">
            {setupSummary.linkedRelationships}/{setupSummary.expectedRelationships}
          </div>
          {#if setupSummary.failedRelationships > 0}
            <div class="text-sm" style="color: var(--color-accent-danger);">{setupSummary.failedRelationships} skipped</div>
          {/if}
        </li>
      </ul>

      {#if setupMessages.length > 0}
        <div class="mt-lg">
          <h4 class="font-semibold mb-sm">Warnings</h4>
          <ul class="flex-col gap-xs" data-testid="setup-messages">
            {#each setupMessages as message, index}
              <li class="text-sm text-warning" data-testid={`setup-message-${index}`}>{message}</li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
  </section>

  <section data-layout="grid">
    <article class="card">
      <div class="card-header">
        <h3 class="card-title">Add Location Manually</h3>
        <button
          type="button"
          class="btn-secondary btn-sm"
          on:click={autofillLocation}
          disabled={isAutofillingLocation}
        >
          {isAutofillingLocation ? 'Generating…' : 'Autofill with LLM'}
        </button>
      </div>
      <div class="card-body">
        <div class="form-control">
          <label class="label" for="location-autofill-prompt">
            <span class="label-text">Autofill prompt</span>
            <span class="label-text-alt">Used when no global prompt is set</span>
          </label>
          <textarea
            id="location-autofill-prompt"
            class="textarea textarea-bordered"
            rows="3"
            bind:value={locationAutofillPrompt}
            on:input={handleLocationPromptInput}
            placeholder="Summarize the kind of location you want the LLM to design"
          />
          <div class="label" role="note">
            <span class="label-text-alt">Defaults adapt based on the current form values.</span>
            <button type="button" class="btn btn-ghost btn-xs" on:click={resetLocationPrompt}>Reset</button>
          </div>
        </div>
        <form on:submit|preventDefault={handleCreateLocation} data-testid="location-form">
          <ul data-layout="grid">
            <li class="field">
              <label>
                <span>Name</span>
                <input
                  bind:value={locationForm.name}
                  required
                  placeholder="Sales Floor"
                  data-testid="location-name-input"
                  use:autofill={{ scope: 'location', field: 'name', seed: () => locationForm }}
                />
              </label>
            </li>
            <li class="field">
              <label>
                <span>Type</span>
                <select
                  bind:value={locationForm.type}
                  data-testid="location-type-select"
                  use:autofill={{
                    scope: 'location',
                    field: 'type',
                    seed: () => locationForm,
                    onValue: handleLocationTypeAutofill
                  }}
                >
                  <option value="room">Room</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="special">Special</option>
                </select>
              </label>
            </li>
          </ul>

          <div class="field">
            <label>
              <span>Description</span>
              <textarea
                bind:value={locationForm.description}
                rows="2"
                placeholder="High energy sales floor with open cubicles"
                data-testid="location-description-input"
                use:autofill={{ scope: 'location', field: 'description', seed: () => locationForm }}
              />
            </label>
          </div>

          <ul data-layout="grid">
            <li class="field">
              <label>
                <span>X</span>
                <input
                  type="number"
                  bind:value={locationForm.x}
                  use:autofill={{
                    scope: 'location',
                    field: 'x',
                    seed: () => locationForm,
                    onValue: makeNumericHandler((value) => locationForm.x = value)
                  }}
                />
              </label>
            </li>
            <li class="field">
              <label>
                <span>Y</span>
                <input
                  type="number"
                  bind:value={locationForm.y}
                  use:autofill={{
                    scope: 'location',
                    field: 'y',
                    seed: () => locationForm,
                    onValue: makeNumericHandler((value) => locationForm.y = value)
                  }}
                />
              </label>
            </li>
            <li class="field">
              <label>
                <span>Width</span>
                <input
                  type="number"
                  bind:value={locationForm.width}
                  use:autofill={{
                    scope: 'location',
                    field: 'width',
                    seed: () => locationForm,
                    onValue: makeNumericHandler((value) => locationForm.width = value)
                  }}
                />
              </label>
            </li>
            <li class="field">
              <label>
                <span>Height</span>
                <input
                  type="number"
                  bind:value={locationForm.height}
                  use:autofill={{
                    scope: 'location',
                    field: 'height',
                    seed: () => locationForm,
                    onValue: makeNumericHandler((value) => locationForm.height = value)
                  }}
                />
              </label>
            </li>
          </ul>

          <div class="flex items-center justify-end mt-lg">
            <button class="btn-primary" type="submit" disabled={creatingLocation} data-testid="create-location-button">
              {#if creatingLocation}
                <span class="loading"></span>
                Creating…
              {:else}
                Add Location
              {/if}
            </button>
          </div>
        </form>
      </div>
    </article>

    <article class="card">
      <div class="card-header">
        <h3 class="card-title">Simulation Controls</h3>
      </div>
      <div class="card-body" data-testid="simulation-controls">
        <p class="text-sm text-secondary">
          Control TinyTroupe directly from here. Choose how many steps to advance and the interface will orchestrate the
          appropriate start/step sequence with the backend.
        </p>

        <div class="field">
          <label>
            <span>Simulation Steps</span>
            <input
              type="number"
              min="1"
              bind:value={simulationSteps}
              data-testid="simulation-step-input"
            />
          </label>
        </div>

        <div class="flex flex-wrap gap-sm">
          <button class="btn-primary" on:click={startSimulation} data-testid="start-simulation-button">
            Start
          </button>
          <button class="btn-secondary" on:click={pauseSimulation} data-testid="pause-simulation-button">
            Pause
          </button>
          <button class="btn-primary" on:click={runSimulationSteps} disabled={isRunningSteps} data-testid="run-steps-button">
            {#if isRunningSteps}
              <span class="loading"></span>
              Running…
            {:else}
              Run Steps
            {/if}
          </button>
          <button class="btn-ghost" on:click={stopSimulation} data-testid="stop-simulation-button">
            Stop
          </button>
        </div>
      </div>
    </article>
  </section>
</main>
