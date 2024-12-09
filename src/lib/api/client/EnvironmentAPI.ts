import type { 
  EnvironmentDTO, 
  CreateEnvironmentRequest, 
  UpdateEnvironmentRequest,
  EnvironmentObservationResponse
} from '../types/environment';
import { API_ENDPOINTS } from '../endpoints';
import { BaseAPI } from './BaseAPI';

export class EnvironmentAPI extends BaseAPI {
  async getEnvironments(): Promise<EnvironmentDTO[]> {
    try {
      return await this.get(API_ENDPOINTS.ENVIRONMENTS);
    } catch (error) {
      console.error('Error fetching environments:', error);
      throw new Error('Failed to fetch environments. Please try again later.');
    }
  }

  async getEnvironment(id: string): Promise<EnvironmentDTO> {
    try {
      return await this.get(API_ENDPOINTS.ENVIRONMENT(id));
    } catch (error) {
      console.error('Error fetching environment:', error);
      throw new Error('Failed to fetch environment. Please try again later.');
    }
  }

  async createEnvironment(environment: CreateEnvironmentRequest): Promise<EnvironmentDTO> {
    try {
      return await this.post(API_ENDPOINTS.ENVIRONMENTS, environment);
    } catch (error) {
      console.error('Error creating environment:', error);
      throw new Error('Failed to create environment. Please try again later.');
    }
  }

  async updateEnvironment(id: string, update: UpdateEnvironmentRequest): Promise<EnvironmentDTO> {
    try {
      return await this.put(API_ENDPOINTS.ENVIRONMENT_UPDATE(id), update);
    } catch (error) {
      console.error('Error updating environment:', error);
      throw new Error('Failed to update environment. Please try again later.');
    }
  }

  async deleteEnvironment(id: string): Promise<void> {
    try {
      return await this.delete(API_ENDPOINTS.ENVIRONMENT(id));
    } catch (error) {
      console.error('Error deleting environment:', error);
      throw new Error('Failed to delete environment. Please try again later.');
    }
  }

  async observeEnvironment(id: string): Promise<EnvironmentObservationResponse> {
    try {
      return await this.get(API_ENDPOINTS.ENVIRONMENT_OBSERVE(id));
    } catch (error) {
      console.error('Error observing environment:', error);
      throw new Error('Failed to observe environment. Please try again later.');
    }
  }

  async getLocations(environmentId: string): Promise<any[]> {
    try {
      return await this.get(API_ENDPOINTS.ENVIRONMENT_LOCATIONS(environmentId));
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw new Error('Failed to fetch locations. Please try again later.');
    }
  }

  async createLocation(environmentId: string, locationData: any): Promise<any> {
    try {
      return await this.post(API_ENDPOINTS.ENVIRONMENT_LOCATIONS(environmentId), locationData);
    } catch (error) {
      console.error('Error creating location:', error);
      throw new Error('Failed to create location. Please try again later.');
    }
  }

  async getLocation(environmentId: string, locationId: string): Promise<any> {
    try {
      return await this.get(API_ENDPOINTS.ENVIRONMENT_LOCATION(environmentId, locationId));
    } catch (error) {
      console.error('Error fetching location:', error);
      throw new Error('Failed to fetch location. Please try again later.');
    }
  }

  async updateLocation(environmentId: string, locationId: string, locationData: any): Promise<any> {
    try {
      return await this.put(API_ENDPOINTS.ENVIRONMENT_LOCATION(environmentId, locationId), locationData);
    } catch (error) {
      console.error('Error updating location:', error);
      throw new Error('Failed to update location. Please try again later.');
    }
  }

  async deleteLocation(environmentId: string, locationId: string): Promise<void> {
    try {
      return await this.delete(API_ENDPOINTS.ENVIRONMENT_LOCATION(environmentId, locationId));
    } catch (error) {
      console.error('Error deleting location:', error);
      throw new Error('Failed to delete location. Please try again later.');
    }
  }

  async getConnections(environmentId: string): Promise<any[]> {
    try {
      return await this.get(API_ENDPOINTS.ENVIRONMENT_CONNECTIONS(environmentId));
    } catch (error) {
      console.error('Error fetching connections:', error);
      throw new Error('Failed to fetch connections. Please try again later.');
    }
  }

  async createConnection(environmentId: string, connectionData: any): Promise<any> {
    try {
      return await this.post(API_ENDPOINTS.ENVIRONMENT_CONNECTIONS(environmentId), connectionData);
    } catch (error) {
      console.error('Error creating connection:', error);
      throw new Error('Failed to create connection. Please try again later.');
    }
  }

  async getConnection(environmentId: string, connectionId: string): Promise<any> {
    try {
      return await this.get(API_ENDPOINTS.ENVIRONMENT_CONNECTION(environmentId, connectionId));
    } catch (error) {
      console.error('Error fetching connection:', error);
      throw new Error('Failed to fetch connection. Please try again later.');
    }
  }

  async updateConnection(environmentId: string, connectionId: string, connectionData: any): Promise<any> {
    try {
      return await this.put(API_ENDPOINTS.ENVIRONMENT_CONNECTION(environmentId, connectionId), connectionData);
    } catch (error) {
      console.error('Error updating connection:', error);
      throw new Error('Failed to update connection. Please try again later.');
    }
  }

  async deleteConnection(environmentId: string, connectionId: string): Promise<void> {
    try {
      return await this.delete(API_ENDPOINTS.ENVIRONMENT_CONNECTION(environmentId, connectionId));
    } catch (error) {
      console.error('Error deleting connection:', error);
      throw new Error('Failed to delete connection. Please try again later.');
    }
  }
}

class ExtendedEnvironmentAPI extends EnvironmentAPI {
  async getAgentLocations(agentId: string): Promise<any[]> {
    try {
      return await this.get(API_ENDPOINTS.AGENT_LOCATIONS(agentId));
    } catch (error) {
      console.error('Error fetching agent locations:', error);
      throw new Error('Failed to fetch agent locations. Please try again later.');
    }
  }

  async createAgentLocation(agentId: string, locationData: any): Promise<any> {
    try {
      return await this.post(API_ENDPOINTS.AGENT_LOCATIONS(agentId), locationData);
    } catch (error) {
      console.error('Error creating agent location:', error);
      throw new Error('Failed to create agent location. Please try again later.');
    }
  }

  async getAgentLocation(agentId: string, locationId: string): Promise<any> {
    try {
      return await this.get(API_ENDPOINTS.AGENT_LOCATION(agentId, locationId));
    } catch (error) {
      console.error('Error fetching agent location:', error);
      throw new Error('Failed to fetch agent location. Please try again later.');
    }
  }

  async updateAgentLocation(agentId: string, locationId: string, locationData: any): Promise<any> {
    try {
      return await this.put(API_ENDPOINTS.AGENT_LOCATION(agentId, locationId), locationData);
    } catch (error) {
      console.error('Error updating agent location:', error);
      throw new Error('Failed to update agent location. Please try again later.');
    }
  }

  async deleteAgentLocation(agentId: string, locationId: string): Promise<void> {
    try {
      return await this.delete(API_ENDPOINTS.AGENT_LOCATION(agentId, locationId));
    } catch (error) {
      console.error('Error deleting agent location:', error);
      throw new Error('Failed to delete agent location. Please try again later.');
    }
  }
}
