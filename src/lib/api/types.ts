import type {
  Agent,
  Location,
  Connection,
  MemoryEntry,
} from '../stores/types';

export type { MemoryEntry } from '../stores/types';

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  wsUrl?: string;
  headers?: Record<string, string>;
  autofillTimeoutMs?: number;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  filter?: Record<string, any>;
  [key: string]: string | number | boolean | undefined | Record<string, any>;
}

export interface SimulationAction {
  type: 'MOVE' | 'TALK' | 'INTERACT';
  agentId: string;
  targetId?: string;
  data: Record<string, any>;
  timestamp: Date;
}

export interface LogFilters {
  agentId?: string;
  action?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  limit?: number;
  offset?: number;
}

export interface SimulationLogDTO {
  timestamp: string | Date;
  agent_id?: string;
  agent_name?: string;
  action_type?: string;
  content?: string;
  metadata?: Record<string, unknown> | null;
}

export interface SimulationStateDTO {
  is_running: boolean;
  current_step: number;
  agents_count: number;
  world_name: string;
}

export interface SimulationControlResponseDTO {
  message: string;
  state: SimulationStateDTO;
}

export interface FacultyAssignPayload {
  key: string;
  parameters?: Record<string, unknown>;
  activate?: boolean;
}

export interface FacultyUpdatePayload {
  parameters?: Record<string, unknown>;
  activate?: boolean;
}

export interface ToolAssignPayload {
  key: string;
  parameters?: Record<string, unknown>;
}

export interface ToolUpdatePayload {
  parameters?: Record<string, unknown>;
}

export interface EpisodicMemoryParams {
  first_n?: number;
  last_n?: number;
  item_type?: string;
  include_omission_info?: boolean;
}

export interface SemanticMemoryParams {
  limit?: number;
  item_type?: string;
}

export interface SemanticMemoryQueryPayload {
  query: string;
  top_k?: number;
}

export interface SemanticMemorySummaryPayload {
  query: string;
  batch_size?: number;
}

export interface SemanticMemoryIngestPayload {
  text?: string;
  url?: string;
  document_name?: string;
}

export interface AutofillRequestPayload {
  form: 'agent' | 'location';
  context?: string;
  seed?: Record<string, unknown>;
}

export type AutofillResponsePayload =
  | { form: 'agent'; data: Agent }
  | { form: 'location'; data: Location };

export interface ScenarioAutofillRequestPayload {
  context?: string;
  seed?: Record<string, unknown>;
}

export interface ScenarioBeatDTO {
  id: number;
  title: string;
  description: string;
  trigger: string;
  blocks_progress: boolean;
}

export interface ScenarioAutofillResponsePayload {
  agents: Agent[];
  locations: Location[];
  beats: ScenarioBeatDTO[];
}
