/**
 * E2E Test: Call Center Simulation (UI-driven)
 *
 * Exercises the TinyVerse web interface to provision the call center scenario,
 * run a DeepSeek-backed simulation, and export artifacts suitable for CI.
 */

import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const ARTIFACTS_DIR = path.join(process.cwd(), 'test-artifacts', 'call-center');
const API_BASE = 'http://localhost:8000';
const mockFlagRaw = (process.env.USE_TINYTROUPE_MOCK ?? '0').toLowerCase();
const usingMock = mockFlagRaw === '1' || mockFlagRaw === 'true';

if (usingMock) {
  throw new Error(
    'TinyVerse E2E requires the real TinyTroupe provider. Set USE_TINYTROUPE_MOCK=0 (or unset) before running the suite.',
  );
}

const REQUEST_TIMEOUT_MS = 360_000;
const EXPECTED_LOCATION_COUNT = 4;
const EXPECTED_AGENT_COUNT = 7;
const DEFAULT_SIMULATION_STEPS = 18;

const resolveSimulationSteps = () => {
  const override = process.env.E2E_SIMULATION_STEPS;
  if (override) {
    const parsed = Number.parseInt(override, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return DEFAULT_SIMULATION_STEPS;
};

const SIMULATION_STEPS = resolveSimulationSteps();

const resolveSimulationTimeout = (steps: number) => {
  const perStepBudget = 300_000;
  const minimumBudget = 420_000;
  return Math.max(minimumBudget, steps * perStepBudget);
};

const stripMarkup = (value?: string | null) => {
  if (!value) return '';
  const withoutAnsi = value.replace(/\u001b\[[0-9;]*m/g, '');
  return withoutAnsi
    .replace(/\[([^\]]+)\]/g, (_, inner: string) => {
      const normalized = inner.replace(/[^A-Za-z]/g, '');
      if (!normalized) return '';
      if (normalized === normalized.toUpperCase()) {
        return `[${inner.trim()}]`;
      }
      return '';
    })
    .replace(/\s+/g, ' ')
    .trim();
};

const humanizeLogEntry = (log: any) => {
  if (!log) return '';

  const action = log?.metadata?.raw_content?.action;
  if (action) {
    const details = stripMarkup(action.content);
    const target = action.target ? ` \u2192 ${action.target}` : '';
    return `${action.type}${target}${details ? ` — ${details}` : ''}`.trim();
  }

  const stimuli = log?.metadata?.raw_content?.stimuli;
  if (Array.isArray(stimuli) && stimuli.length > 0) {
    return stimuli
      .map((stim: any) => {
        const label = stim.source ? `${stim.source}: ` : '';
        return `${label}${stripMarkup(stim.content)}`.trim();
      })
      .join(' | ');
  }

  return stripMarkup(log?.content);
};

fs.rmSync(ARTIFACTS_DIR, { recursive: true, force: true });
fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

test.describe('Call Center Simulation E2E', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Setup: Configure call center via UI', async () => {
    await page.goto('/');
    await expect(page.getByTestId('world-builder')).toBeVisible({ timeout: 15_000 });

    // Ensure clean state: delete all existing agents and locations first
    try {
      const agentsResponse = await page.request.get(`${API_BASE}/agents`);
      if (agentsResponse.ok()) {
        const existingAgents = await agentsResponse.json();
        await Promise.all(
          existingAgents.map((agent: any) =>
            page.request.delete(`${API_BASE}/agents/${agent.id}`)
          )
        );
      }

      const locationsResponse = await page.request.get(`${API_BASE}/locations`);
      if (locationsResponse.ok()) {
        const existingLocations = await locationsResponse.json();
        await Promise.all(
          existingLocations.map((location: any) =>
            page.request.delete(`${API_BASE}/locations/${location.id}`)
          )
        );
      }
    } catch (error) {
      console.warn('Pre-cleanup warning:', error);
    }

    // Wait for any error toasts to clear
    await page.waitForTimeout(2000);

    const quickSetupButton = page.getByTestId('call-center-quick-setup');
    await quickSetupButton.click();
    await expect(quickSetupButton).toBeEnabled({ timeout: 360_000 });

    await expect(page.getByTestId('setup-status-badge')).toHaveText(/Complete|Needs Attention/, {
      timeout: 360_000,
    });

    await expect
      .poll(async () => page.locator('[data-testid="location-list"] li').count(), { timeout: 180_000 })
      .toBeGreaterThanOrEqual(1);
    await expect
      .poll(async () => page.locator('[data-testid="agent-list"] li').count(), { timeout: 180_000 })
      .toBeGreaterThanOrEqual(1);

    await expect(page.getByTestId('summary-last-sync')).not.toHaveText('Never', { timeout: 10_000 });

    const locationProgress = await page.getByTestId('setup-locations-progress').innerText();
    const agentProgress = await page.getByTestId('setup-agents-progress').innerText();
    const relationshipProgress = await page.getByTestId('setup-relationships-progress').innerText();

    const [locationsProvisioned, locationTarget] = locationProgress.split('/').map((value) => Number(value.trim()));
    const [agentsProvisioned, agentTarget] = agentProgress.split('/').map((value) => Number(value.trim()));
    const [relationshipsLinked, relationshipsTarget] = relationshipProgress
      .split('/')
      .map((value) => Number(value.trim()));

  expect(locationTarget).toBe(EXPECTED_LOCATION_COUNT);
  expect(locationsProvisioned).toBeGreaterThanOrEqual(EXPECTED_LOCATION_COUNT);
  expect(agentTarget).toBe(EXPECTED_AGENT_COUNT);
  expect(agentsProvisioned).toBeGreaterThanOrEqual(EXPECTED_AGENT_COUNT);
    expect(relationshipsTarget).toBeGreaterThanOrEqual(relationshipsLinked);

    const statusText = await page.getByTestId('setup-status-badge').innerText();
    const warningsList = page.locator('[data-testid="setup-messages"]');
    const warningsVisible = await warningsList.isVisible().catch(() => false);
    if (statusText.includes('Needs Attention')) {
      expect(warningsVisible).toBeTruthy();
    } else {
      expect(warningsVisible).toBeFalsy();
    }

    const stepsInput = page.getByTestId('simulation-step-input');
    await stepsInput.fill(String(SIMULATION_STEPS));

    const locationsResponse = await page.request.get(`${API_BASE}/locations`, { timeout: REQUEST_TIMEOUT_MS });
    expect(locationsResponse.ok()).toBeTruthy();
    const locations = await locationsResponse.json();
    expect(Array.isArray(locations)).toBeTruthy();
    expect(locations.length).toBe(locationsProvisioned);
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'locations.json'), JSON.stringify(locations, null, 2));

    const agentsResponse = await page.request.get(`${API_BASE}/agents`, { timeout: REQUEST_TIMEOUT_MS });
    expect(agentsResponse.ok()).toBeTruthy();
    const agents = await agentsResponse.json();
    expect(Array.isArray(agents)).toBeTruthy();
    expect(agents.length).toBe(agentsProvisioned);
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'agents.json'), JSON.stringify(agents, null, 2));
  });

  test('Simulation: Run call center operations', async () => {
    const simulationSteps = SIMULATION_STEPS;
    const scenarioLabel = 'boiler_room_call_center';
    test.setTimeout(resolveSimulationTimeout(simulationSteps));

    await page.getByTestId('start-simulation-button').click();

    const runStepsButton = page.getByTestId('run-steps-button');
    await runStepsButton.click();
    await expect(runStepsButton).toBeEnabled({ timeout: resolveSimulationTimeout(simulationSteps) });

    await expect
      .poll(async () => {
        const response = await page.request.get(`${API_BASE}/simulation/state`, {
          timeout: REQUEST_TIMEOUT_MS,
        });
        if (!response.ok()) {
          throw new Error('Failed to poll simulation state');
        }
        const data = await response.json();
        return data?.current_step ?? 0;
      }, { timeout: resolveSimulationTimeout(simulationSteps) })
      .toBeGreaterThanOrEqual(simulationSteps);

    const stateResponse = await page.request.get(`${API_BASE}/simulation/state`, {
      timeout: REQUEST_TIMEOUT_MS,
    });
    expect(stateResponse.ok()).toBeTruthy();
    const state = await stateResponse.json();

    const logLimit = Math.max(300, simulationSteps * 40);
    const logsResponse = await page.request.get(`${API_BASE}/simulation/logs?limit=${logLimit}`, {
      timeout: REQUEST_TIMEOUT_MS,
    });
    expect(logsResponse.ok()).toBeTruthy();
    const logs = await logsResponse.json();

    const cleanedLogs = (Array.isArray(logs) ? logs : []).map((log) => ({
      ...log,
      cleaned_content: humanizeLogEntry(log),
    }));

    const transcripts = [
      {
        step: simulationSteps,
        timestamp: new Date().toISOString(),
        logs: cleanedLogs,
        state_snapshot: {
          current_step: state?.current_step ?? simulationSteps,
          is_running: state?.is_running ?? false,
          agents_count: state?.agents_count ?? cleanedLogs.length,
          world_name: state?.world_name ?? 'TinyVerse Call Center',
        },
      },
    ];

    const readableTranscript = transcripts
      .map((entry) => {
        const header = `=== STEP ${entry.step} — ${entry.timestamp} ===`;
        const body = entry.logs
          .map((log: any) => {
            const speaker = log.agent_name ?? 'System';
            const line = humanizeLogEntry(log);
            return `[${speaker}] ${line}`.trim();
          })
          .join('\n');
        return `${header}\n${body}`;
      })
      .join('\n\n');

    const scenarioManifest = (() => {
      const agentsPath = path.join(ARTIFACTS_DIR, 'agents.json');
      const locationsPath = path.join(ARTIFACTS_DIR, 'locations.json');
      const parsedAgents = fs.existsSync(agentsPath)
        ? JSON.parse(fs.readFileSync(agentsPath, 'utf-8'))
        : [];
      const parsedLocations = fs.existsSync(locationsPath)
        ? JSON.parse(fs.readFileSync(locationsPath, 'utf-8'))
        : [];
      return { parsedAgents, parsedLocations };
    })();

    const connectionsResponse = await page.request.get(`${API_BASE}/world/connections`, {
      timeout: REQUEST_TIMEOUT_MS,
    });
    expect(connectionsResponse.ok()).toBeTruthy();
    const connections = await connectionsResponse.json();

    const involvementByAgent = cleanedLogs.reduce((acc: Record<string, number>, log: any) => {
      const agent = log.agent_name ?? 'System';
      acc[agent] = (acc[agent] ?? 0) + 1;
      return acc;
    }, {});

    const dominantActions = cleanedLogs.reduce((acc: Record<string, number>, log: any) => {
      const action = log.action_type ?? 'unknown';
      acc[action] = (acc[action] ?? 0) + 1;
      return acc;
    }, {});

    const topAgents = Object.entries(involvementByAgent)
      .sort(([, aCount], [, bCount]) => bCount - aCount)
      .slice(0, 5)
      .map(([name, logCount]) => ({ name, logCount }));

    const topActions = Object.entries(dominantActions)
      .sort(([, aCount], [, bCount]) => bCount - aCount)
      .slice(0, 5)
      .map(([action, count]) => ({ action, count }));

    const summary = {
      scenario: scenarioLabel,
      generated_at: new Date().toISOString(),
      requested_steps: simulationSteps,
      completed_steps: state?.current_step ?? simulationSteps,
      logs_captured: cleanedLogs.length,
      top_agents: topAgents,
      dominant_actions: topActions,
    };

    const finalStateArtifact = {
      ...state,
      scenario: scenarioLabel,
      requested_steps: simulationSteps,
      logs_captured: cleanedLogs.length,
    };

    const manifest = {
      scenario: scenarioLabel,
      generated_at: new Date().toISOString(),
      environment: 'boiler-room-scam',
      simulation: {
        requested_steps: simulationSteps,
        completed_steps: state?.current_step ?? simulationSteps,
      },
      locations: scenarioManifest.parsedLocations,
      agents: scenarioManifest.parsedAgents,
      connections,
    };

    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'simulation_logs_raw.json'),
      JSON.stringify(logs, null, 2),
    );

    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'simulation_transcripts.json'),
      JSON.stringify(transcripts, null, 2),
    );

    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'simulation_transcript_readable.txt'),
      readableTranscript,
    );

    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'simulation_state.json'),
      JSON.stringify(finalStateArtifact, null, 2),
    );

    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'simulation_summary.json'),
      JSON.stringify(summary, null, 2),
    );

    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'scenario_manifest.json'),
      JSON.stringify(manifest, null, 2),
    );

    // Generate per-agent log files
    const agentLogs: Record<string, any[]> = {};
    cleanedLogs.forEach((log: any) => {
      const agentName = log.agent_name ?? 'System';
      if (!agentLogs[agentName]) {
        agentLogs[agentName] = [];
      }
      agentLogs[agentName].push(log);
    });

    const agentLogsDir = path.join(ARTIFACTS_DIR, 'agent-logs');
    fs.mkdirSync(agentLogsDir, { recursive: true });

    for (const [agentName, logs] of Object.entries(agentLogs)) {
      const sanitizedName = agentName.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
      const agentLogFile = path.join(agentLogsDir, `${sanitizedName}.json`);
      fs.writeFileSync(agentLogFile, JSON.stringify(logs, null, 2));

      const readableLog = logs
        .map((log: any, idx: number) => {
          const timestamp = log.timestamp || 'N/A';
          const action = log.action_type || 'unknown';
          const content = humanizeLogEntry(log);
          return `[${idx + 1}] ${timestamp}\n    Action: ${action}\n    ${content}\n`;
        })
        .join('\n');

      const readableLogFile = path.join(agentLogsDir, `${sanitizedName}.txt`);
      fs.writeFileSync(readableLogFile, `Agent Activity Log: ${agentName}\n${'='.repeat(60)}\n\n${readableLog}`);
    }
  });

  test('Analysis: Generate performance metrics', async () => {
    const agentsResponse = await page.request.get(`${API_BASE}/agents`, { timeout: REQUEST_TIMEOUT_MS });
    expect(agentsResponse.ok()).toBeTruthy();
    const agents = await agentsResponse.json();

    const metrics = {
      dialers: agents.filter((agent: any) => /dialer|opener|harvester/i.test(agent.occupation ?? '')),
      closers: agents.filter((agent: any) => /closer|hammer/i.test(agent.occupation ?? '')),
      laundering: agents.filter((agent: any) => /wire|facilitator|compliance/i.test(agent.occupation ?? '')),
      targets: agents.filter((agent: any) => /investor|target|mark/i.test(agent.occupation ?? '')),
      total_agents: agents.length,
      performance_summary: {
        frontline: agents
          .filter((agent: any) => /dialer|opener|harvester/i.test(agent.occupation ?? ''))
          .map((agent: any) => ({ name: agent.name, occupation: agent.occupation })),
      },
    };

    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'performance_metrics.json'),
      JSON.stringify(metrics, null, 2),
    );

    const complianceReport = {
      title: 'Call Center Compliance Report',
      date: new Date().toISOString(),
      total_agents: agents.length,
      total_violations: 0,
      high_risk_agents: metrics.closers.map((agent: any) => ({
        name: agent.name,
        occupation: agent.occupation,
      })),
      recommendations: [
        'Maintain compliance oversight on high-pressure closers.',
        'Rotate telequestioners through refresher training weekly.',
        'Schedule post-shift audits for randomly sampled call transcripts.',
      ],
    };

    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'compliance_report.json'),
      JSON.stringify(complianceReport, null, 2),
    );

    const readableReport = `
CALL CENTER COMPLIANCE REPORT
Generated: ${complianceReport.date}

SUMMARY:
- Total Agents: ${complianceReport.total_agents}
- High-Risk Roles Under Review: ${complianceReport.high_risk_agents.length}

RECOMMENDATIONS:
${complianceReport.recommendations.map((item, index) => `${index + 1}. ${item}`).join('\n')}
    `.trim();

    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'compliance_report.txt'), readableReport);

    // Generate end-of-day agent reviews and reports
    const reviewAgentsResponse = await page.request.get(`${API_BASE}/agents`, { timeout: REQUEST_TIMEOUT_MS });
    expect(reviewAgentsResponse.ok()).toBeTruthy();
    const allAgents = await reviewAgentsResponse.json();

    const logsResponse = await page.request.get(`${API_BASE}/simulation/logs?limit=1000`, {
      timeout: REQUEST_TIMEOUT_MS,
    });
    expect(logsResponse.ok()).toBeTruthy();
    const allLogs = await logsResponse.json();

    const agentReviews: any[] = [];
    const agentLogsByName: Record<string, any[]> = {};

    allLogs.forEach((log: any) => {
      const agentName = log.agent_name ?? 'System';
      if (!agentLogsByName[agentName]) {
        agentLogsByName[agentName] = [];
      }
      agentLogsByName[agentName].push(log);
    });

    for (const agent of allAgents) {
      const agentLogs = agentLogsByName[agent.name] || [];
      const actionCount = agentLogs.length;
      const actionTypes = agentLogs.reduce((acc: Record<string, number>, log: any) => {
        const action = log.action_type ?? 'unknown';
        acc[action] = (acc[action] ?? 0) + 1;
        return acc;
      }, {});

      const review = {
        agent_name: agent.name,
        agent_occupation: agent.occupation,
        date: new Date().toISOString(),
        total_actions: actionCount,
        action_breakdown: actionTypes,
        key_activities: agentLogs.slice(0, 5).map((log: any) => humanizeLogEntry(log)),
        performance_notes: actionCount > 10 ? 'High activity volume' : actionCount > 5 ? 'Moderate activity' : 'Low activity',
      };

      agentReviews.push(review);
    }

    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'agent_reviews.json'),
      JSON.stringify(agentReviews, null, 2),
    );

    // Generate TQ Report Email (daily summary to lead)
    const dialerAgents = allAgents.filter((a: any) => /dialer|opener/i.test(a.occupation ?? ''));
    const closerAgents = allAgents.filter((a: any) => /closer|hammer/i.test(a.occupation ?? ''));
    const targetAgents = allAgents.filter((a: any) => /investor|target/i.test(a.occupation ?? ''));

    const dialerActivity = dialerAgents.map((agent: any) => {
      const logs = agentLogsByName[agent.name] || [];
      return {
        name: agent.name,
        calls_made: logs.length,
        key_actions: logs.slice(0, 3).map((l: any) => humanizeLogEntry(l)),
      };
    });

    const closerActivity = closerAgents.map((agent: any) => {
      const logs = agentLogsByName[agent.name] || [];
      return {
        name: agent.name,
        close_attempts: logs.length,
        key_actions: logs.slice(0, 3).map((l: any) => humanizeLogEntry(l)),
      };
    });

    const targetActivity = targetAgents.map((agent: any) => {
      const logs = agentLogsByName[agent.name] || [];
      return {
        name: agent.name,
        interactions: logs.length,
      };
    });

    const tqReport = {
      subject: `Daily Boiler Room Report - ${new Date().toISOString().split('T')[0]}`,
      from: 'operations@boilerroom.internal',
      to: 'lead@boilerroom.internal',
      date: new Date().toISOString(),
      body: {
        summary: {
          total_simulation_steps: SIMULATION_STEPS,
          total_agents: allAgents.length,
          total_interactions: allLogs.length,
          dialer_count: dialerAgents.length,
          closer_count: closerAgents.length,
          target_count: targetAgents.length,
        },
        dialer_performance: dialerActivity,
        closer_performance: closerActivity,
        target_engagement: targetActivity,
        recommendations: [
          'Review high-volume dialers for script compliance',
          'Monitor closer tactics for regulatory exposure',
          'Assess target resistance patterns for pivot strategy',
        ],
      },
    };

    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'tq_report_email.json'),
      JSON.stringify(tqReport, null, 2),
    );

    const emailText = `
FROM: ${tqReport.from}
TO: ${tqReport.to}
DATE: ${tqReport.date}
SUBJECT: ${tqReport.subject}

${'='.repeat(70)}

DAILY OPERATIONS SUMMARY

Total Simulation Steps: ${tqReport.body.summary.total_simulation_steps}
Total Agents: ${tqReport.body.summary.total_agents}
Total Interactions: ${tqReport.body.summary.total_interactions}

TEAM BREAKDOWN:
- Dialers: ${tqReport.body.summary.dialer_count}
- Closers: ${tqReport.body.summary.closer_count}
- Targets: ${tqReport.body.summary.target_count}

${'='.repeat(70)}

DIALER PERFORMANCE:
${dialerActivity.map((d: any) => `
  ${d.name}: ${d.calls_made} calls
    Top Actions:
${d.key_actions.map((a: string) => `      - ${a}`).join('\n')}
`).join('\n')}

${'='.repeat(70)}

CLOSER PERFORMANCE:
${closerActivity.map((c: any) => `
  ${c.name}: ${c.close_attempts} attempts
    Top Actions:
${c.key_actions.map((a: string) => `      - ${a}`).join('\n')}
`).join('\n')}

${'='.repeat(70)}

TARGET ENGAGEMENT:
${targetActivity.map((t: any) => `  ${t.name}: ${t.interactions} interactions`).join('\n')}

${'='.repeat(70)}

RECOMMENDATIONS:
${tqReport.body.recommendations.map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')}

${'='.repeat(70)}

End of Report
    `.trim();

    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'tq_report_email.txt'), emailText);
  });

  test('Cleanup: Stop simulation and verify artifacts', async () => {
    await page.getByTestId('stop-simulation-button').click();

    const expectedFiles = [
      'locations.json',
      'agents.json',
      'simulation_logs_raw.json',
      'simulation_transcripts.json',
      'simulation_transcript_readable.txt',
      'simulation_state.json',
      'simulation_summary.json',
      'scenario_manifest.json',
      'performance_metrics.json',
      'compliance_report.json',
      'compliance_report.txt',
      'agent_reviews.json',
      'tq_report_email.json',
      'tq_report_email.txt',
    ];

    for (const file of expectedFiles) {
      const filePath = path.join(ARTIFACTS_DIR, file);
      expect(fs.existsSync(filePath)).toBeTruthy();
    }

    // Verify per-agent logs directory
    const agentLogsDir = path.join(ARTIFACTS_DIR, 'agent-logs');
    expect(fs.existsSync(agentLogsDir)).toBeTruthy();
    const agentLogFiles = fs.readdirSync(agentLogsDir);
    expect(agentLogFiles.length).toBeGreaterThan(0);
  });
});
