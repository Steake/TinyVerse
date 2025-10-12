<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '../../api';
  import { agentStore } from '../../stores/agents';
  import type { Agent } from '../../stores/types';
  import { logsToCSV, logsToJSON } from '../../utils/transcript';
  // (Optional) WebSocket service could be used to trigger refreshes

  type LogEntry = {
    id?: string;
    timestamp: string | Date;
    agentId?: string;
    agent_id?: string;
    agentName?: string;
    agent_name?: string;
    action?: string;
    action_type?: string;
    content?: string;
    metadata?: any;
  };

  export let open = true;

  let logs: LogEntry[] = [];
  let filtered: LogEntry[] = [];
  let search = '';
  let agentFilter = 'all';
  let typeFilter = 'dialogue';
  let limit = 200;
  let autoScroll = true;
  let container: HTMLDivElement | null = null;
  let exporting = false;
  
  // Resizable panel state
  let panelHeight = 300; // Default height in pixels
  let isResizing = false;
  let resizeStartY = 0;
  let resizeStartHeight = 0;

  // Load saved height from localStorage
  onMount(() => {
    const saved = localStorage.getItem('transcript-panel-height');
    if (saved) {
      panelHeight = parseInt(saved, 10);
    }
    refresh();
  });

  function startResize(event: MouseEvent) {
    isResizing = true;
    resizeStartY = event.clientY;
    resizeStartHeight = panelHeight;
    event.preventDefault();
  }

  function handleResize(event: MouseEvent) {
    if (!isResizing) return;
    const deltaY = resizeStartY - event.clientY; // Invert because panel grows upward
    const newHeight = Math.max(150, Math.min(800, resizeStartHeight + deltaY));
    panelHeight = newHeight;
    localStorage.setItem('transcript-panel-height', newHeight.toString());
  }

  function stopResize() {
    isResizing = false;
  }

  // Add global mouse listeners for resize
  $: if (typeof window !== 'undefined') {
    if (isResizing) {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', stopResize);
    } else {
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', stopResize);
    }
  }

  const dialogueish = ['TALK','SAY','SPEAK','DIALOG','DIALOGUE','UTTER','MESSAGE','CHAT','UTTERANCE'];

  function normalize(entry: LogEntry) {
    const agentId = (entry.agentId || entry.agent_id) as string | undefined;
    const agentName = (entry.agentName || entry.agent_name) as string | undefined;
    const action = (entry.action || entry.action_type || '').toString();
    const content = (entry.content || entry?.metadata?.rendering || '').toString();
    return { ...entry, agentId, agentName, action, content };
  }

  async function refresh() {
    try {
      const res = await api.getLogs({ limit });
      const data = (res as any)?.data ?? [];
      if (Array.isArray(data)) {
        logs = data.map(normalize).sort((a, b) => new Date(a.timestamp as any).getTime() - new Date(b.timestamp as any).getTime());
        applyFilters();
      }
    } catch (e) {
      console.error('TranscriptDrawer: failed to fetch logs', e);
    }
  }

  function applyFilters() {
    const q = search.trim().toLowerCase();
    const selectedAgent = agentFilter;
    const isDialogue = (a: string) => dialogueish.some(k => a.toUpperCase().includes(k));
    filtered = logs.filter(l => {
      const matchAgent = selectedAgent === 'all' ? true : (l.agentId === selectedAgent);
      const matchType = typeFilter === 'all' ? true : isDialogue(l.action || '');
      const matchText = q.length === 0 ? true : (l.content || '').toLowerCase().includes(q);
      return matchAgent && matchType && matchText;
    });
    // Maintain scroll to bottom if enabled
    if (autoScroll) {
      queueMicrotask(() => {
        container?.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      });
    }
  }

  function onScroll() {
    if (!container) return;
    const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 40;
    autoScroll = nearBottom;
  }

  function handleWsTick() {
    // Lightweight: refetch when a simulation step arrives
    refresh();
  }

  onMount(() => {
    refresh();
    // Piggyback on websocket reconnects/steps by polling on interval too
    const t = setInterval(refresh, 5000);
    const unsub = (() => {
      // No direct event bus here; rely on ws-driven projection calling refresh via state tick
      return () => {};
    })();
    return () => { clearInterval(t); unsub(); };
  });

  $: applyFilters();

  // Keep a live view of agents via store auto-subscription (Svelte magic $agentStore)

  function formatTime(ts: string | Date): string {
    try {
      const d = typeof ts === 'string' ? new Date(ts) : (ts as Date);
      return d.toLocaleTimeString();
    } catch {
      return '';
    }
  }

  function download(filename: string, content: string, type = 'text/plain') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function resolveAgentName(agentId?: string, agentName?: string): string {
    if (agentName && agentName.length) return agentName;
    const list = ($agentStore as Agent[]) || [];
    const match = list.find((a: Agent) => a.id === agentId);
    return match?.name || 'Unknown';
  }

  async function exportJSON() {
    try {
      exporting = true;
      const payload = logsToJSON(filtered as any);
      download('transcript.json', payload, 'application/json');
    } finally {
      exporting = false;
    }
  }

  async function exportCSV() {
    try {
      exporting = true;
      const csv = logsToCSV(filtered as any, (ts) => formatTime(ts));
      download('transcript.csv', csv, 'text/csv');
    } finally {
      exporting = false;
    }
  }
</script>

<section class="transcript-panel">
  <!-- Resize handle -->
  {#if open}
    <div 
      class="resize-handle" 
      on:mousedown={startResize}
      role="separator"
      aria-valuenow={panelHeight}
      aria-valuemin={150}
      aria-valuemax={800}
      title="Drag to resize"
    >
      <div class="resize-line"></div>
    </div>
  {/if}

  <header class="header">
    <div class="left">
      <button class="btn btn-sm btn-outline" on:click={() => (open = !open)} aria-expanded={open} aria-controls="transcript-body">
        {open ? 'Hide' : 'Show'} Transcript
      </button>
      <span class="meta">{filtered.length} entries</span>
    </div>
    <div class="filters">
      <button class="btn btn-outline btn-xs" aria-busy={exporting} title="Export JSON" on:click={exportJSON}>📦 JSON</button>
      <button class="btn btn-outline btn-xs" aria-busy={exporting} title="Export CSV" on:click={exportCSV}>📄 CSV</button>
      <select class="select select-xs" bind:value={agentFilter} on:change={applyFilters}>
        <option value="all">All agents</option>
        {#each $agentStore as a (a.id)}
          <option value={a.id}>{a.name}</option>
        {/each}
      </select>
      <select class="select select-xs" bind:value={typeFilter} on:change={applyFilters}>
        <option value="dialogue">Dialogue</option>
        <option value="all">All types</option>
      </select>
      <input class="input input-xs" type="search" placeholder="Search…" bind:value={search} on:input={applyFilters} />
    </div>
  </header>

  {#if open}
    <div 
      id="transcript-body" 
      class="body" 
      style="height: {panelHeight}px"
      bind:this={container} 
      on:scroll={onScroll}
    >
      {#if filtered.length === 0}
        <div class="empty">No entries yet.</div>
      {:else}
        {#each filtered as item, index (item.id || `${item.timestamp}-${item.agentId || item.agentName || ''}-${index}`)}
          <div class="row">
            <div class="ts">{formatTime(item.timestamp)}</div>
            <div class="agent">{resolveAgentName(item.agentId, item.agentName)}</div>
            <div class="text">{item.content}</div>
          </div>
        {/each}
      {/if}
    </div>
  {/if}
</section>

<style lang="postcss">
  .transcript-panel {
    @apply border border-[var(--color-border-subtle)] rounded-xl backdrop-blur-md;
    background-color: var(--color-bg-secondary);
    position: relative;
  }
  
  .resize-handle {
    @apply absolute top-0 left-0 right-0 cursor-ns-resize;
    height: 8px;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .resize-handle:hover .resize-line,
  .resize-handle:active .resize-line {
    @apply bg-primary;
  }
  
  .resize-line {
    @apply bg-base-300 rounded-full;
    width: 40px;
    height: 3px;
    transition: background-color 150ms ease;
  }
  
  .header {
    @apply flex items-center justify-between gap-3 px-3 py-2;
    padding-top: 12px; /* Make room for resize handle */
  }
  
  .filters {
    @apply flex items-center gap-2;
  }
  
  .meta {
    @apply text-xs text-[var(--color-text-muted)];
  }
  
  .body {
    @apply overflow-auto px-3 space-y-2 border-t border-[var(--color-border-subtle)];
    /* Height is controlled by inline style */
    /* Add padding to prevent footer from obscuring content */
    padding-top: 0.5rem;
    padding-bottom: 60px; /* Space for fixed footer */
  }
  
  .empty { 
    @apply text-sm text-[var(--color-text-muted)] italic; 
  }
  
  .row { 
    @apply grid grid-cols-[auto_auto_1fr] gap-3 items-start text-sm;
  }
  
  .ts { 
    @apply text-[var(--color-text-muted)] tabular-nums text-xs;
  }
  
  .agent { 
    @apply font-semibold text-[var(--color-text)] min-w-[100px];
  }
  
  .text { 
    @apply text-[var(--color-text)];
  }
</style>
