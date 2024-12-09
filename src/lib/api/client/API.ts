import { AgentAPI } from './AgentAPI';
import { EnvironmentAPI } from './EnvironmentAPI';
import { StoryAPI } from './StoryAPI';
import { API_ENDPOINTS } from '../endpoints';
import { BaseAPI } from './BaseAPI';
import { DEFAULT_CONFIG } from '../config';

export class API extends BaseAPI {
  agent: AgentAPI;
  environment: EnvironmentAPI;
  story: StoryAPI;

  constructor(baseUrl: string = DEFAULT_CONFIG.baseUrl) {
    super(baseUrl);
    this.agent = new AgentAPI(baseUrl);
    this.environment = new EnvironmentAPI(baseUrl);
    this.story = new StoryAPI(baseUrl);
  }

  async clearStorage(): Promise<void> {
    return this.post(API_ENDPOINTS.CLEAR_STORAGE, {});
  }

  async getSimulationState(): Promise<any> {
    return this.get(API_ENDPOINTS.SIMULATION_STATE);
  }

  async controlSimulation(data: any): Promise<any> {
    return this.post(API_ENDPOINTS.SIMULATION_CONTROL, data);
  }

  async getSimulationLogs(queryParams: any): Promise<any> {
    return this.get(API_ENDPOINTS.SIMULATION_LOGS, queryParams);
  }

  async getAgents(): Promise<any> {
    return this.get(API_ENDPOINTS.AGENTS);
  }

  async getAgent(id: string): Promise<any> {
    return this.get(API_ENDPOINTS.AGENT(id));
  }

  async createAgent(data: any): Promise<any> {
    return this.post(API_ENDPOINTS.AGENTS, data);
  }

  async updateAgent(id: string, data: any): Promise<any> {
    return this.patch(API_ENDPOINTS.AGENT(id), data);
  }

  async deleteAgent(id: string): Promise<any> {
    return this.delete(API_ENDPOINTS.AGENT(id));
  }

  async getEnvironments(): Promise<any> {
    return this.get(API_ENDPOINTS.ENVIRONMENTS);
  }

  async getEnvironment(id: string): Promise<any> {
    return this.get(API_ENDPOINTS.ENVIRONMENT(id));
  }

  async createEnvironment(data: any): Promise<any> {
    return this.post(API_ENDPOINTS.ENVIRONMENTS, data);
  }

  async updateEnvironment(id: string, data: any): Promise<any> {
    return this.patch(API_ENDPOINTS.ENVIRONMENT(id), data);
  }

  async deleteEnvironment(id: string): Promise<any> {
    return this.delete(API_ENDPOINTS.ENVIRONMENT(id));
  }

  async getStories(): Promise<any> {
    return this.get(API_ENDPOINTS.STORIES);
  }

  async getStory(id: string): Promise<any> {
    return this.get(API_ENDPOINTS.STORY(id));
  }

  async createStory(data: any): Promise<any> {
    return this.post(API_ENDPOINTS.STORIES, data);
  }

  async updateStory(id: string, data: any): Promise<any> {
    return this.patch(API_ENDPOINTS.STORY(id), data);
  }

  async deleteStory(id: string): Promise<any> {
    return this.delete(API_ENDPOINTS.STORY(id));
  }
}

export const api = new API();
