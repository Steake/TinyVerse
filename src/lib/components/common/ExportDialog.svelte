<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { ExportFormat, ExportOptions } from '../../utils/export/types';
  import { exportProject } from '../../utils/export';
  import BaseModal from './BaseModal.svelte';

  export let show = false;

  const dispatch = createEventDispatcher<{
    close: void;
  }>();

  let format: ExportFormat = 'json';
  let options: ExportOptions = {
    includeMetadata: true,
    excludeSimulationLogs: false,
    compressOutput: false
  };
  let isExporting = false;
  let error: string | null = null;

  async function handleExport() {
    isExporting = true;
    error = null;

    try {
      await exportProject(format, options);
      dispatch('close');
    } catch (e: any) {
      error = e.message || 'Export failed';
    } finally {
      isExporting = false;
    }
  }
</script>

<BaseModal
  {show}
  title="Export Project"
  on:close={() => dispatch('close')}
>
  <div class="space-y-4">
    <div class="form-control">
      <label class="label" for="format">
        <span class="label-text">Export Format</span>
      </label>
      <select
        id="format"
        class="select select-bordered"
        bind:value={format}
      >
        <option value="json">JSON</option>
        <option value="yaml">YAML</option>
      </select>
    </div>

    <div class="space-y-2">
      <label class="label cursor-pointer">
        <span class="label-text">Include Metadata</span>
        <input
          type="checkbox"
          class="checkbox"
          bind:checked={options.includeMetadata}
        />
      </label>

      <label class="label cursor-pointer">
        <span class="label-text">Exclude Simulation Logs</span>
        <input
          type="checkbox"
          class="checkbox"
          bind:checked={options.excludeSimulationLogs}
        />
      </label>

      <label class="label cursor-pointer">
        <span class="label-text">Compress Output</span>
        <input
          type="checkbox"
          class="checkbox"
          bind:checked={options.compressOutput}
        />
      </label>
    </div>

    {#if error}
      <div class="alert alert-error">
        <span>{error}</span>
      </div>
    {/if}

    <div class="modal-action">
      <button
        type="button"
        class="btn"
        on:click={() => dispatch('close')}
        disabled={isExporting}
      >
        Cancel
      </button>
      <button
        type="button"
        class="btn btn-primary"
        on:click={handleExport}
        disabled={isExporting}
      >
        {isExporting ? 'Exporting...' : 'Export'}
      </button>
    </div>
  </div>
</BaseModal>