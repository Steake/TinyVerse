import type { 
  SimulationStateDTO,
  SimulationLogDTO,
  SimulationActionRequest,
  SimulationControlRequest,
  LogQueryParams 
} from '../types/simulation';
import { API_ENDPOINTS } from '../endpoints';
import { BaseAPI } from './BaseAPI';

export class SimulationAPI extends BaseAPI {
  async getState(): Promise<SimulationStateDTO> {
    try {
      return await this.get(API_ENDPOINTS.SIMULATION_STATE);
    } catch (error) {
      console.error('Error fetching simulation state:', error);
      throw new Error('Failed to fetch simulation state. Please try again later.');
    }
  }

  async control(request: SimulationControlRequest): Promise<SimulationStateDTO> {
    try {
      return await this.post(API_ENDPOINTS.SIMULATION_CONTROL, request);
    } catch (error) {
      console.error('Error controlling simulation:', error);
      throw new Error('Failed to control simulation. Please try again later.');
    }
  }

  async executeAction(action: SimulationActionRequest): Promise<SimulationLogDTO> {
    try {
      return await this.post(API_ENDPOINTS.SIMULATION_ACTION, action);
    } catch (error) {
      console.error('Error executing simulation action:', error);
      throw new Error('Failed to execute simulation action. Please try again later.');
    }
  }

  async getLogs(params?: LogQueryParams): Promise<SimulationLogDTO[]> {
    try {
      return await this.get(API_ENDPOINTS.SIMULATION_LOGS, { params });
    } catch (error) {
      console.error('Error fetching simulation logs:', error);
      throw new Error('Failed to fetch simulation logs. Please try again later.');
    }
  }
}
