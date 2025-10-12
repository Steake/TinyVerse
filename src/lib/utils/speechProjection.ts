import type { Interaction } from './mock-data/grand-stage';

export type DialogueLog = {
  timestamp?: string | Date;
  agentId?: string;
  agent_id?: string;
  agentName?: string;
  agent_name?: string;
  action?: string;
  action_type?: string;
  content?: string;
  data?: { content?: string; text?: string };
  metadata?: { rendering?: string } & Record<string, unknown>;
};

export function extractContent(log: DialogueLog): string {
  return (
    log?.content ||
    log?.data?.content ||
    log?.data?.text ||
    (log as any)?.metadata?.rendering ||
    ''
  ) as string;
}

export function estimateDurationMs(text: string): number {
  const len = Math.max(1, (text || '').trim().length);
  const base = 2200;
  const perChar = 45;
  const est = base + perChar * Math.min(140, len);
  return Math.max(1600, Math.min(8000, est));
}

export function normalizeDialogueEntry(log: DialogueLog) {
  const agentId = (log.agentId || log.agent_id) as string | undefined;
  const agentName = (log.agentName || log.agent_name) as string | undefined;
  const action = (log.action || log.action_type || '').toString();
  const content = extractContent(log)?.toString() || '';
  const timestamp = new Date(log.timestamp || Date.now());
  return { timestamp, agentId, agentName, action, content };
}

export function buildInteractionFromLog(log: DialogueLog, resolvedAgentId: string): Interaction {
  const { timestamp, content } = normalizeDialogueEntry(log);
  return {
    id: `int-${resolvedAgentId}-${timestamp.getTime()}`,
    type: 'conversation',
    participants: [resolvedAgentId],
    content: (content || '').trim(),
    startTime: timestamp,
    duration: estimateDurationMs(content || ''),
    mood: 'neutral'
  } as Interaction;
}
