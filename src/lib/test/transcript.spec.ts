import { describe, it, expect } from 'vitest';
import { logsToCSV, logsToJSON } from '../utils/transcript';
import { extractContent, estimateDurationMs, normalizeDialogueEntry } from '../utils/speechProjection';

describe('transcript/export utilities', () => {
  const logs = [
    { timestamp: '2024-01-01T10:00:00Z', agentId: 'a1', agentName: 'Alice', action: 'TALK', content: 'Hello, world' },
    { timestamp: '2024-01-01T10:00:05Z', agentId: 'a2', agentName: 'Bob', action: 'SAY', content: 'Hi, Alice' }
  ];

  it('produces JSON', () => {
    const json = logsToJSON(logs);
    const parsed = JSON.parse(json);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].agentName).toBe('Alice');
  });

  it('produces CSV with headers and quoted content', () => {
    const csv = logsToCSV(logs);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('timestamp,agentId,agentName,action,content');
    expect(lines).toHaveLength(3);
  });
});

describe('speech projection helpers', () => {
  it('extracts content from different shapes', () => {
    expect(extractContent({ content: 'A' } as any)).toBe('A');
    expect(extractContent({ data: { content: 'B' } } as any)).toBe('B');
    expect(extractContent({ data: { text: 'C' } } as any)).toBe('C');
    expect(extractContent({ metadata: { rendering: 'D' } } as any)).toBe('D');
  });

  it('normalizes dialogue entries', () => {
    const n = normalizeDialogueEntry({ timestamp: '2024-01-01T00:00:00Z', agent_id: 'x', agent_name: 'Y', action_type: 'TALK', content: 'Hi' });
    expect(n.agentId).toBe('x');
    expect(n.agentName).toBe('Y');
    expect(n.action).toBe('TALK');
    expect(n.content).toBe('Hi');
    expect(n.timestamp instanceof Date).toBe(true);
  });

  it('estimates duration with bounds', () => {
    const short = estimateDurationMs('hi');
    const long = estimateDurationMs('x'.repeat(500));
    expect(short).toBeGreaterThanOrEqual(1600);
    expect(long).toBeLessThanOrEqual(8000);
  });
});
