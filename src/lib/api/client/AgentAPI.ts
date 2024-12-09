import type { 
  AgentDTO, 
  CreateAgentRequest, 
  UpdateAgentRequest,
  AgentObservationResponse
} from '../types/agent';
import { API } from '../../api';
import { API_ENDPOINTS } from '../endpoints';
import { BaseAPI } from './BaseAPI';

export class AgentAPI extends BaseAPI {
  async createAgent(agent: CreateAgentRequest): Promise<AgentDTO | undefined> {
    try {
      const response: { data: AgentDTO } = await this.post(API_ENDPOINTS.AGENTS, agent);
      return response.data;
    } catch (error) {
      console.error('Error creating agent:', error);
      throw new Error('Failed to create agent. Please try again later.');
    }
  }

  async updateAgent(agent: UpdateAgentRequest): Promise<AgentDTO | undefined> {
    try {
      const response: { data: AgentDTO } = await this.put(API_ENDPOINTS.AGENTS, agent);
      return response.data;
    } catch (error) {
      console.error('Error updating agent:', error);
      throw new Error('Failed to update agent. Please try again later.');
    }
  }

  async listAgents(): Promise<any | undefined> {
    try {
      const response: { data: any } = await this.get(API_ENDPOINTS.AGENTS);
      return response.data;
    } catch (error) {
      console.error('Error listing agents:', error);
      throw new Error('Failed to list agents. Please try again later.');
    }
  }

  async deleteAgent(id: string): Promise<void> {
    try {
      return await this.delete(API_ENDPOINTS.AGENT(id));
    } catch (error) {
      console.error('Error deleting agent:', error);
      throw new Error('Failed to delete agent. Please try again later.');
    }
  }

  async observeAgent(id: string): Promise<AgentObservationResponse> {
    try {
      return await this.get(API_ENDPOINTS.AGENT_OBSERVE(id));
    } catch (error) {
      console.error('Error observing agent:', error);
      throw new Error('Failed to observe agent. Please try again later.');
    }
  }

  async interactWithAgent(id: string, message: string): Promise<any> {
    try {
      return await this.post(API_ENDPOINTS.AGENT_INTERACT(id), { message });
    } catch (error) {
      console.error('Error interacting with agent:', error);
      throw new Error('Failed to interact with agent. Please try again later.');
    }
  }

  async controlAgent(id: string, action: string): Promise<any> {
    try {
      return await this.post(API_ENDPOINTS.AGENT_CONTROL(id), { action });
    } catch (error) {
      console.error('Error controlling agent:', error);
      throw new Error('Failed to control agent. Please try again later.');
    }
  }
}

export default AgentAPI;
