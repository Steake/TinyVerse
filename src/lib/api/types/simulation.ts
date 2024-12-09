export interface SimulationStateDTO {
  isRunning: boolean;
  currentTime: string;
  speed: number;
}

export interface SimulationLogDTO {
  id: string;
  timestamp: string;
  agentId: string;
  action: 'MOVE' | 'TALK' | 'INTERACT';
  data: Record<string, any>;
}

export interface SimulationActionRequest {
  type: 'MOVE' | 'TALK' | 'INTERACT';
  agentId: string;
  targetId?: string;
  data: Record<string, any>;
}

export interface SimulationControlRequest {
  command: 'START' | 'PAUSE' | 'STEP';
  speed?: number;
}

export interface LogQueryParams {
  agentId?: string;
  action?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  limit?: number;
  offset?: number;
}