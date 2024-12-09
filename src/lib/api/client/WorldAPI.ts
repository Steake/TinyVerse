import type { 
  LocationDTO, 
  ConnectionDTO,
  CreateLocationRequest,
  UpdateLocationRequest,
  CreateConnectionRequest 
} from '../types/world';
import { API_ENDPOINTS } from '../endpoints';
import { BaseAPI } from './BaseAPI';

export class WorldAPI extends BaseAPI {
  async getLocations(): Promise<LocationDTO[]> {
    try {
      return await this.get(API_ENDPOINTS.LOCATIONS);
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw new Error('Failed to fetch locations. Please try again later.');
    }
  }

  async createLocation(location: CreateLocationRequest): Promise<LocationDTO> {
    try {
      return await this.post(API_ENDPOINTS.LOCATIONS, location);
    } catch (error) {
      console.error('Error creating location:', error);
      throw new Error('Failed to create location. Please try again later.');
    }
  }

  async updateLocation(id: string, location: UpdateLocationRequest): Promise<LocationDTO> {
    try {
      return await this.patch(API_ENDPOINTS.LOCATION_DETAILS(id), location);
    } catch (error) {
      console.error('Error updating location:', error);
      throw new Error('Failed to update location. Please try again later.');
    }
  }

  async deleteLocation(id: string): Promise<void> {
    try {
      return await this.delete(API_ENDPOINTS.LOCATION_DETAILS(id));
    } catch (error) {
      console.error('Error deleting location:', error);
      throw new Error('Failed to delete location. Please try again later.');
    }
  }

  async getConnections(): Promise<ConnectionDTO[]> {
    try {
      return await this.get(API_ENDPOINTS.CONNECTIONS);
    } catch (error) {
      console.error('Error fetching connections:', error);
      throw new Error('Failed to fetch connections. Please try again later.');
    }
  }

  async createConnection(connection: CreateConnectionRequest): Promise<ConnectionDTO> {
    try {
      return await this.post(API_ENDPOINTS.CONNECTIONS, connection);
    } catch (error) {
      console.error('Error creating connection:', error);
      throw new Error('Failed to create connection. Please try again later.');
    }
  }

  async deleteConnection(id: string): Promise<void> {
    try {
      return await this.delete(API_ENDPOINTS.CONNECTION_DETAILS(id));
    } catch (error) {
      console.error('Error deleting connection:', error);
      throw new Error('Failed to delete connection. Please try again later.');
    }
  }
}
