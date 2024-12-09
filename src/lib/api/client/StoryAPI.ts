import type { 
  StoryDTO, 
  CreateStoryRequest, 
  UpdateStoryRequest,
  StoryObservationResponse
} from '../types/story';
import { API_ENDPOINTS } from '../endpoints';
import { BaseAPI } from './BaseAPI';

export class StoryAPI extends BaseAPI {
  async getStories(): Promise<StoryDTO[]> {
    try {
      return await this.get(API_ENDPOINTS.STORIES);
    } catch (error) {
      console.error('Error fetching stories:', error);
      throw new Error('Failed to fetch stories. Please try again later.');
    }
  }

  async getStory(id: string): Promise<StoryDTO> {
    try {
      return await this.get(API_ENDPOINTS.STORY(id));
    } catch (error) {
      console.error('Error fetching story:', error);
      throw new Error('Failed to fetch story. Please try again later.');
    }
  }

  async createStory(story: CreateStoryRequest): Promise<StoryDTO> {
    try {
      return await this.post(API_ENDPOINTS.STORIES, story);
    } catch (error) {
      console.error('Error creating story:', error);
      throw new Error('Failed to create story. Please try again later.');
    }
  }

  async updateStory(id: string, update: UpdateStoryRequest): Promise<StoryDTO> {
    try {
      return await this.put(API_ENDPOINTS.STORY_UPDATE(id), update);
    } catch (error) {
      console.error('Error updating story:', error);
      throw new Error('Failed to update story. Please try again later.');
    }
  }

  async deleteStory(id: string): Promise<void> {
    try {
      return await this.delete(API_ENDPOINTS.STORY(id));
    } catch (error) {
      console.error('Error deleting story:', error);
      throw new Error('Failed to delete story. Please try again later.');
    }
  }

  async observeStory(id: string): Promise<StoryObservationResponse> {
    try {
      return await this.get(API_ENDPOINTS.STORY_OBSERVE(id));
    } catch (error) {
      console.error('Error observing story:', error);
      throw new Error('Failed to observe story. Please try again later.');
    }
  }
}
