import type { Skill, Relationship, Routine } from '../../stores/types';

export interface AgentDTO {
  name: string;
}

export interface CreateAgentRequest {
  name: string;
}

export interface UpdateAgentRequest {
  name: string;
}

export interface AgentInteractionRequest {
  message: string;
}

export interface AgentObservationResponse {
  observations: string;
}

export interface AgentControlRequest {
  action: string;
}

export interface AgentActionResponse {
  result: any[];
}
