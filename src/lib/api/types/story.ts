export interface StoryDTO {
  id: string;
  name: string;
  purpose: string;
}

export interface CreateStoryRequest {
  environment_id?: string;
  agent_id?: string;
  purpose: string;
}

export interface UpdateStoryRequest {
  name?: string;
  purpose?: string;
}

export interface StoryObservationResponse {
  observations: string;
}
