import type { SimulationLog, SimulationLogMetadata } from '../stores/types';
import type { SimulationLogDTO } from '../api/types';

export function toIsoString(timestamp: string | Date | undefined): string {
  if (!timestamp) {
    return new Date().toISOString();
  }

  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }

  const parsed = new Date(timestamp);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

export function normalizeSimulationMetadata(
  metadata: Record<string, unknown> | null | undefined
): SimulationLogMetadata | undefined {
  if (!metadata) {
    return undefined;
  }

  const transformed: SimulationLogMetadata = {};

  for (const [key, value] of Object.entries(metadata)) {
    if (value === undefined) continue;

    if (key === 'raw_content' && value && typeof value === 'object') {
      transformed.rawContent = value as Record<string, unknown>;
      continue;
    }

    transformed[key] = value;
  }

  return Object.keys(transformed).length > 0 ? transformed : undefined;
}

export function createSimulationLogId(dto: SimulationLogDTO, seed?: string | number): string {
  const timestamp = toIsoString(dto.timestamp);
  const parts = [
    timestamp,
    dto.agent_id ?? '',
    dto.action_type ?? '',
    dto.content ?? '',
    seed?.toString() ?? ''
  ];

  return parts.join('|');
}

export function normalizeSimulationLog(dto: SimulationLogDTO, seed?: number): SimulationLog {
  return {
    id: createSimulationLogId(dto, seed),
    timestamp: toIsoString(dto.timestamp),
    agentId: dto.agent_id ?? undefined,
    agentName: dto.agent_name ?? undefined,
    action: dto.action_type ?? 'unknown',
    content: dto.content ?? '',
    metadata: normalizeSimulationMetadata(dto.metadata)
  };
}
