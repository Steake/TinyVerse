<script lang="ts">
  import { simulationStore, type SimulationLog } from '../../stores/simulation';
  import { agentStore } from '../../stores/agents';
  import Papa from 'papaparse';

  let extractionFields = [
    { id: 'timestamp', label: 'Timestamp', enabled: true },
    { id: 'agentId', label: 'Agent ID', enabled: true },
    { id: 'agentName', label: 'Agent Name', enabled: true },
    { id: 'action', label: 'Action', enabled: true },
    { id: 'data', label: 'Data', enabled: true }
  ];

  let filterAgent: string = '';
  let filterAction: string = '';
  let startDate: string = '';
  let endDate: string = '';
  let results: any[] = [];
  let loading = false;
  let error: string | null = null;

  $: filteredLogs = filterLogs($simulationStore.logs);

  function filterLogs(logs: SimulationLog[]): SimulationLog[] {
    return logs.filter(log => {
      if (filterAgent && log.agentId !== filterAgent) return false;
      if (filterAction && log.action !== filterAction) return false;
      if (startDate && new Date(log.timestamp) < new Date(startDate)) return false;
      if (endDate && new Date(log.timestamp) > new Date(endDate)) return false;
      return true;
    });
  }

  function extractResults() {
    loading = true;
    error = null;

    try {
      results = filteredLogs.map(log => {
        const agent = $agentStore.find(a => a.id === log.agentId);
        const result: any = {};

        extractionFields.forEach(field => {
          if (!field.enabled) return;

          switch (field.id) {
            case 'timestamp':
              result.timestamp = log.timestamp.toISOString();
              break;
            case 'agentId':
              result.agentId = log.agentId;
              break;
            case 'agentName':
              result.agentName = agent?.name || 'Unknown';
              break;
            case 'action':
              result.action = log.action;
              break;
            case 'data':
              result.data = JSON.stringify(log.data);
              break;
          }
        });

        return result;
      });
    } catch (e: any) {
      error = e.message || 'Analysis failed';
      results = [];
    } finally {
      loading = false;
    }
  }

  function exportCSV() {
    const csv = Papa.unparse(results);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'simulation_results.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function exportJSON() {
    const json = JSON.stringify(results, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'simulation_results.json');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
</script>

<div class="space-y-6">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- Filters -->
    <div class="form-control">
      <label class="label" for="filterAgent">Agent</label>
      <select
        id="filterAgent"
        class="select select-bordered"
        bind:value={filterAgent}
      >
        <option value="">All Agents</option>
        {#each $agentStore as agent}
          <option value={agent.id}>{agent.name}</option>
        {/each}
      </select>
    </div>

    <div class="form-control">
      <label class="label" for="filterAction">Action</label>
      <select
        id="filterAction"
        class="select select-bordered"
        bind:value={filterAction}
      >
        <option value="">All Actions</option>
        <option value="MOVE">Move</option>
        <option value="TALK">Talk</option>
      </select>
    </div>

    <div class="form-control">
      <label class="label" for="startDate">Start Date</label>
      <input
        type="datetime-local"
        id="startDate"
        class="input input-bordered"
        bind:value={startDate}
      />
    </div>

    <div class="form-control">
      <label class="label" for="endDate">End Date</label>
      <input
        type="datetime-local"
        id="endDate"
        class="input input-bordered"
        bind:value={endDate}
      />
    </div>
  </div>

  <!-- Extraction Fields -->
  <div class="space-y-2">
    <h3 class="text-lg font-semibold">Extraction Fields</h3>
    <div class="flex flex-wrap gap-2">
      {#each extractionFields as field}
        <label class="label cursor-pointer gap-2">
          <input
            type="checkbox"
            class="checkbox"
            bind:checked={field.enabled}
          />
          <span class="label-text">{field.label}</span>
        </label>
      {/each}
    </div>
  </div>

  <!-- Actions -->
  <div class="flex gap-2">
    <button
      class="btn btn-primary"
      on:click={extractResults}
      disabled={loading}
    >
      {loading ? 'Extracting...' : 'Extract Results'}
    </button>
    <button
      class="btn"
      on:click={exportCSV}
      disabled={loading || results.length === 0}
    >
      Export CSV
    </button>
    <button
      class="btn"
      on:click={exportJSON}
      disabled={loading || results.length === 0}
    >
      Export JSON
    </button>
  </div>

  {#if error}
    <div class="alert alert-error">
      <span>{error}</span>
    </div>
  {/if}

  <!-- Results Table -->
  {#if results.length > 0}
    <div class="overflow-x-auto">
      <table class="table">
        <thead>
          <tr>
            {#each extractionFields as field}
              {#if field.enabled}
                <th>{field.label}</th>
              {/if}
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each results as result}
            <tr>
              {#each extractionFields as field}
                {#if field.enabled}
                  <td>{result[field.id]}</td>
                {/if}
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>