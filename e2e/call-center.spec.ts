/**
 * E2E Test: Call Center Simulation
 * 
 * Simulates a complete call center operation with:
 * - TQ Floor (Telequestioners - cold callers)
 * - Closers (Deal closers)
 * - Compliance team
 * - Customers (simulated leads)
 * 
 * Produces artifacts:
 * - Call transcripts
 * - Performance metrics
 * - Compliance logs
 */

import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const ARTIFACTS_DIR = path.join(process.cwd(), 'test-artifacts', 'call-center');
const API_BASE = 'http://localhost:8000';

// Ensure artifacts directory exists
fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

test.describe('Call Center Simulation E2E', () => {
  let page: Page;
  
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Setup: Create call center environment and agents', async () => {
    // Navigate to app
    await page.goto('/');
    await expect(page.locator('text=Playwright Desk')).toBeVisible({ timeout: 10000 });

    // Create locations via API (faster than UI)
    const locations = [
      {
        name: 'TQ Floor',
        description: 'Telequestioners cold calling area - high energy sales floor',
        capacity: 20,
        environment_type: 'office',
        metadata: {
          department: 'sales',
          function: 'cold_calling',
          noise_level: 'high',
        }
      },
      {
        name: 'Closers Room',
        description: 'Deal closing specialists - experienced sales veterans',
        capacity: 10,
        environment_type: 'office',
        metadata: {
          department: 'sales',
          function: 'closing',
          noise_level: 'moderate',
        }
      },
      {
        name: 'Compliance Office',
        description: 'Compliance and quality assurance team',
        capacity: 5,
        environment_type: 'office',
        metadata: {
          department: 'compliance',
          function: 'qa',
          noise_level: 'low',
        }
      },
      {
        name: 'Customer Zone',
        description: 'Virtual customer environment',
        capacity: 100,
        environment_type: 'virtual',
        metadata: {
          type: 'customer_pool',
        }
      }
    ];

    const createdLocations: any[] = [];
    for (const loc of locations) {
      const response = await page.request.post(`${API_BASE}/locations`, {
        data: loc
      });
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      createdLocations.push(data);
      console.log(`Created location: ${data.name}`);
    }

    // Save location IDs for later use
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'locations.json'),
      JSON.stringify(createdLocations, null, 2)
    );

    // Create TQ agents (telequestioners)
    const tqAgents = [
      {
        name: 'Jake "The Snake" Morrison',
        age: 28,
        description: 'Aggressive TQ with a gift for opening cold leads. High energy, sometimes crosses lines.',
        personality: 'extroverted, competitive, pushy',
        occupation: 'Telequestioner',
        routines: [
          { name: 'morning_coffee', description: 'Gets pumped up with coffee and motivational speeches', frequency: 'daily' },
          { name: 'dial_blitz', description: 'Makes 50+ calls in rapid succession', frequency: 'multiple_daily' },
        ],
        skills: [
          { name: 'cold_calling', proficiency: 85 },
          { name: 'objection_handling', proficiency: 75 },
          { name: 'lead_qualification', proficiency: 70 },
        ],
        metadata: {
          role: 'tq',
          department: 'sales',
          location: 'TQ Floor',
          performance_tier: 'top',
          compliance_issues: 2,
        }
      },
      {
        name: 'Maria Hernandez',
        age: 24,
        description: 'Bilingual TQ with excellent rapport-building skills. Empathetic approach, high conversion.',
        personality: 'warm, empathetic, persistent',
        occupation: 'Telequestioner',
        routines: [
          { name: 'lead_review', description: 'Reviews lead information before calling', frequency: 'daily' },
          { name: 'follow_up_tracking', description: 'Meticulously tracks callbacks', frequency: 'daily' },
        ],
        skills: [
          { name: 'cold_calling', proficiency: 80 },
          { name: 'rapport_building', proficiency: 90 },
          { name: 'bilingual_communication', proficiency: 95 },
        ],
        metadata: {
          role: 'tq',
          department: 'sales',
          location: 'TQ Floor',
          performance_tier: 'top',
          compliance_issues: 0,
        }
      }
    ];

    // Create Closer agents
    const closerAgents = [
      {
        name: 'Richard "Dick" Steele',
        age: 42,
        description: 'Veteran closer. Master of psychological pressure and urgency creation. Gets deals done.',
        personality: 'dominant, persuasive, ruthless',
        occupation: 'Senior Closer',
        routines: [
          { name: 'deal_review', description: 'Reviews warm leads from TQ floor', frequency: 'daily' },
          { name: 'closing_ritual', description: 'Visualization and mental prep before closing calls', frequency: 'daily' },
        ],
        skills: [
          { name: 'closing', proficiency: 95 },
          { name: 'negotiation', proficiency: 90 },
          { name: 'psychological_pressure', proficiency: 85 },
        ],
        metadata: {
          role: 'closer',
          department: 'sales',
          location: 'Closers Room',
          performance_tier: 'elite',
          compliance_issues: 5,
        }
      }
    ];

    // Create Compliance agents
    const complianceAgents = [
      {
        name: 'Sarah Chen',
        age: 35,
        description: 'Compliance officer. Detail-oriented, by-the-book, frequently clashes with aggressive sales tactics.',
        personality: 'analytical, cautious, principled',
        occupation: 'Compliance Officer',
        routines: [
          { name: 'call_monitoring', description: 'Reviews random call recordings for compliance', frequency: 'daily' },
          { name: 'incident_reports', description: 'Documents compliance violations', frequency: 'as_needed' },
        ],
        skills: [
          { name: 'regulatory_knowledge', proficiency: 95 },
          { name: 'call_auditing', proficiency: 90 },
          { name: 'documentation', proficiency: 85 },
        ],
        metadata: {
          role: 'compliance',
          department: 'compliance',
          location: 'Compliance Office',
        }
      }
    ];

    // Create Customer agents
    const customerAgents = [
      {
        name: 'Bob Johnson',
        age: 55,
        description: 'Small business owner, skeptical but interested. Budget-conscious.',
        personality: 'skeptical, pragmatic, cautious',
        occupation: 'Business Owner',
        routines: [],
        skills: [],
        metadata: {
          role: 'customer',
          customer_type: 'qualified_lead',
          budget: 'medium',
          pain_points: ['marketing', 'lead_generation'],
          location: 'Customer Zone',
        }
      },
      {
        name: 'Jennifer Williams',
        age: 38,
        description: 'Marketing director, very busy, low patience for sales calls.',
        personality: 'busy, impatient, direct',
        occupation: 'Marketing Director',
        routines: [],
        skills: [],
        metadata: {
          role: 'customer',
          customer_type: 'hard_lead',
          budget: 'high',
          pain_points: ['time_management', 'roi'],
          location: 'Customer Zone',
        }
      },
      {
        name: 'Tom Peters',
        age: 62,
        description: 'Retiree, lonely, enjoys chatting. Easy mark but low budget.',
        personality: 'friendly, naive, trusting',
        occupation: 'Retired',
        routines: [],
        skills: [],
        metadata: {
          role: 'customer',
          customer_type: 'soft_lead',
          budget: 'low',
          pain_points: ['boredom', 'social_connection'],
          location: 'Customer Zone',
        }
      }
    ];

    const allAgents = [...tqAgents, ...closerAgents, ...complianceAgents, ...customerAgents];
    const createdAgents: any[] = [];

    for (const agent of allAgents) {
      const response = await page.request.post(`${API_BASE}/agents`, {
        data: agent
      });
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      createdAgents.push(data);
      console.log(`Created agent: ${data.name} (${data.metadata?.role || 'unknown'})`);
    }

    // Save agent IDs
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'agents.json'),
      JSON.stringify(createdAgents, null, 2)
    );

    // Create relationships (reporting structure, rivalries, etc.)
    const tqIds = createdAgents.filter(a => a.metadata?.role === 'tq').map(a => a.id);
    const closerIds = createdAgents.filter(a => a.metadata?.role === 'closer').map(a => a.id);
    const complianceIds = createdAgents.filter(a => a.metadata?.role === 'compliance').map(a => a.id);

    // TQs report to Closers
    for (const tqId of tqIds) {
      for (const closerId of closerIds) {
        await page.request.post(`${API_BASE}/agents/${tqId}/relationships`, {
          data: {
            target_id: closerId,
            relationship_type: 'reports_to',
            strength: 70,
            description: 'TQ transfers warm leads to Closer'
          }
        });
      }
    }

    // Compliance monitors everyone
    for (const agentId of [...tqIds, ...closerIds]) {
      for (const complianceId of complianceIds) {
        await page.request.post(`${API_BASE}/agents/${complianceId}/relationships`, {
          data: {
            target_id: agentId,
            relationship_type: 'monitors',
            strength: 60,
            description: 'Compliance oversight'
          }
        });
      }
    }

    console.log('Setup complete: Call center environment created');
  });

  test('Simulation: Run call center operations', async () => {
    // Start simulation via API
    const startResponse = await page.request.post(`${API_BASE}/simulation/control`, {
      data: { action: 'start' }
    });
    expect(startResponse.ok()).toBeTruthy();

    console.log('Simulation started');

    // Run simulation steps (simulate a day of calls)
    const simulationSteps = 20; // 20 steps = simulated interactions
    const transcripts: any[] = [];

    for (let step = 1; step <= simulationSteps; step++) {
      console.log(`Running simulation step ${step}/${simulationSteps}`);
      
      const stepResponse = await page.request.post(`${API_BASE}/simulation/control`, {
        data: { action: 'step', steps: 1 }
      });
      expect(stepResponse.ok()).toBeTruthy();

      // Fetch simulation state
      const stateResponse = await page.request.get(`${API_BASE}/simulation/state`);
      const state = await stateResponse.json();

      // Fetch logs for this step
      const logsResponse = await page.request.get(`${API_BASE}/simulation/logs`);
      const logs = await logsResponse.json();

      // Record interactions
      if (logs && logs.length > 0) {
        transcripts.push({
          step,
          timestamp: new Date().toISOString(),
          logs: logs.slice(-10), // Last 10 log entries
          state_snapshot: {
            active_agents: state.agents?.length || 0,
            locations: state.locations?.length || 0,
          }
        });
      }

      // Wait a bit between steps
      await page.waitForTimeout(500);
    }

    // Save transcripts
    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'simulation_transcripts.json'),
      JSON.stringify(transcripts, null, 2)
    );

    // Generate human-readable transcript
    const readableTranscript = transcripts.map(t => {
      return `\n=== STEP ${t.step} - ${t.timestamp} ===\n` +
        t.logs.map((log: any) => 
          `[${log.agent_name || 'System'}]: ${log.action} ${log.description ? '- ' + log.description : ''}`
        ).join('\n');
    }).join('\n\n');

    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'simulation_transcript_readable.txt'),
      readableTranscript
    );

    console.log(`Simulation complete. Transcripts saved to ${ARTIFACTS_DIR}`);
  });

  test('Analysis: Generate performance metrics', async () => {
    // Fetch all agents
    const agentsResponse = await page.request.get(`${API_BASE}/agents`);
    const agents = await agentsResponse.json();

    // Calculate metrics by role
    const metrics = {
      tq_agents: agents.filter((a: any) => a.metadata?.role === 'tq'),
      closer_agents: agents.filter((a: any) => a.metadata?.role === 'closer'),
      compliance_agents: agents.filter((a: any) => a.metadata?.role === 'compliance'),
      customer_agents: agents.filter((a: any) => a.metadata?.role === 'customer'),
      
      total_compliance_issues: agents.reduce((sum: number, a: any) => 
        sum + (a.metadata?.compliance_issues || 0), 0
      ),
      
      performance_summary: {
        top_performers: agents
          .filter((a: any) => a.metadata?.performance_tier === 'top' || a.metadata?.performance_tier === 'elite')
          .map((a: any) => ({ name: a.name, role: a.metadata?.role })),
      }
    };

    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'performance_metrics.json'),
      JSON.stringify(metrics, null, 2)
    );

    // Generate compliance report
    const complianceReport = {
      title: 'Call Center Compliance Report',
      date: new Date().toISOString(),
      total_agents: agents.length,
      agents_with_violations: agents.filter((a: any) => (a.metadata?.compliance_issues || 0) > 0).length,
      total_violations: metrics.total_compliance_issues,
      high_risk_agents: agents
        .filter((a: any) => (a.metadata?.compliance_issues || 0) >= 3)
        .map((a: any) => ({
          name: a.name,
          role: a.metadata?.role,
          violations: a.metadata?.compliance_issues,
          location: a.metadata?.location,
        })),
      recommendations: [
        'Implement additional training for agents with 3+ violations',
        'Increase monitoring frequency for Closers Room',
        'Review sales scripts for compliance alignment',
      ]
    };

    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'compliance_report.json'),
      JSON.stringify(complianceReport, null, 2)
    );

    const readableReport = `
CALL CENTER COMPLIANCE REPORT
Generated: ${complianceReport.date}

SUMMARY:
- Total Agents: ${complianceReport.total_agents}
- Agents with Violations: ${complianceReport.agents_with_violations}
- Total Violations: ${complianceReport.total_violations}

HIGH-RISK AGENTS:
${complianceReport.high_risk_agents.map((a: any) => 
  `- ${a.name} (${a.role}) - ${a.violations} violations - Location: ${a.location}`
).join('\n')}

RECOMMENDATIONS:
${complianceReport.recommendations.map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')}
    `.trim();

    fs.writeFileSync(
      path.join(ARTIFACTS_DIR, 'compliance_report.txt'),
      readableReport
    );

    console.log(`Analysis complete. Reports saved to ${ARTIFACTS_DIR}`);
  });

  test('Cleanup: Stop simulation and verify artifacts', async () => {
    // Stop simulation
    const stopResponse = await page.request.post(`${API_BASE}/simulation/control`, {
      data: { action: 'stop' }
    });
    expect(stopResponse.ok()).toBeTruthy();

    // Verify all artifacts were created
    const expectedFiles = [
      'locations.json',
      'agents.json',
      'simulation_transcripts.json',
      'simulation_transcript_readable.txt',
      'performance_metrics.json',
      'compliance_report.json',
      'compliance_report.txt',
    ];

    for (const file of expectedFiles) {
      const filePath = path.join(ARTIFACTS_DIR, file);
      expect(fs.existsSync(filePath)).toBeTruthy();
      console.log(`✓ Artifact created: ${file}`);
    }

    console.log(`\nAll artifacts available at: ${ARTIFACTS_DIR}`);
  });
});
