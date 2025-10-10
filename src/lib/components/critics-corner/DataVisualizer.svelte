<script lang="ts">
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  import type { ChartConfiguration, ChartType } from 'chart.js';
  import { simulationStore, type SimulationLog } from '../../stores/simulation';
  import { agentStore } from '../../stores/agents';

  let canvas: HTMLCanvasElement;
  let chart: Chart | null = null;
  let chartType: ChartType = 'bar';
  let metric = 'actions';
  let timeframe = 'hourly';

  const chartTypes = [
    { id: 'bar', label: 'Bar Chart' },
    { id: 'line', label: 'Line Chart' },
    { id: 'pie', label: 'Pie Chart' }
  ];

  const metrics = [
    { id: 'actions', label: 'Actions by Type' },
    { id: 'agents', label: 'Agent Activity' },
    { id: 'timeline', label: 'Activity Timeline' }
  ];

  const timeframes = [
    { id: 'hourly', label: 'Hourly' },
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' }
  ];

  $: if (chart) {
    updateChart();
  }

  onMount(() => {
    createChart();
    return () => {
      if (chart) chart.destroy();
    };
  });

  function createChart() {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (chart) {
      chart.destroy();
    }

    chart = new Chart(ctx, {
      type: chartType,
      data: {
        labels: [],
        datasets: []
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          }
        }
      }
    });

    updateChart();
  }

  function updateChart() {
    if (!chart) return;

    const data = processData();
    const config = chart.config as ChartConfiguration<ChartType>;
    config.data = data as ChartConfiguration<ChartType>['data'];
    config.type = chartType;
    chart.update();
  }

  function processData() {
    const logs = $simulationStore.logs;

    switch (metric) {
      case 'actions':
        return processActionData(logs);
      case 'agents':
        return processAgentData(logs);
      case 'timeline':
        return processTimelineData(logs);
      default:
        return { labels: [], datasets: [] };
    }
  }

  function processActionData(logs: SimulationLog[]) {
    const actionCounts = logs.reduce<Record<string, number>>((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(actionCounts),
      datasets: [{
        label: 'Actions',
        data: Object.values(actionCounts),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)'
        ]
      }]
    };
  }

  function processAgentData(logs: SimulationLog[]) {
    const agentCounts = logs.reduce<Record<string, number>>((acc, log) => {
      const agent = $agentStore.find(a => a.id === log.agentId);
      const name = log.agentName || agent?.name || 'Unknown';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(agentCounts),
      datasets: [{
        label: 'Activities',
        data: Object.values(agentCounts),
        backgroundColor: 'rgba(75, 192, 192, 0.5)'
      }]
    };
  }

  function processTimelineData(logs: SimulationLog[]) {
    const timeGroups = logs.reduce<Record<string, number>>((acc, log) => {
      const date = new Date(log.timestamp);
      let key: string;

      switch (timeframe) {
        case 'hourly':
          key = date.toISOString().slice(0, 13);
          break;
        case 'daily':
          key = date.toISOString().slice(0, 10);
          break;
        case 'weekly':
          const week = Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000));
          key = `Week ${week}`;
          break;
        default:
          key = date.toISOString();
      }

      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(timeGroups),
      datasets: [{
        label: 'Activities',
        data: Object.values(timeGroups),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    };
  }

  function downloadChart() {
    const link = document.createElement('a');
    link.download = 'chart.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
</script>

<div class="space-y-6">
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="form-control">
      <label class="label" for="chartType">Chart Type</label>
      <select
        id="chartType"
        class="select select-bordered"
        bind:value={chartType}
      >
        {#each chartTypes as type}
          <option value={type.id}>{type.label}</option>
        {/each}
      </select>
    </div>

    <div class="form-control">
      <label class="label" for="metric">Metric</label>
      <select
        id="metric"
        class="select select-bordered"
        bind:value={metric}
      >
        {#each metrics as m}
          <option value={m.id}>{m.label}</option>
        {/each}
      </select>
    </div>

    <div class="form-control">
      <label class="label" for="timeframe">Timeframe</label>
      <select
        id="timeframe"
        class="select select-bordered"
        bind:value={timeframe}
      >
        {#each timeframes as tf}
          <option value={tf.id}>{tf.label}</option>
        {/each}
      </select>
    </div>
  </div>

  <div class="h-[400px] relative">
    <canvas bind:this={canvas} />
  </div>

  <div class="flex justify-end">
    <button class="btn btn-primary" on:click={downloadChart}>
      Download Chart
    </button>
  </div>
</div>