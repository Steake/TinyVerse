export const API_ENDPOINTS = {
  // Agent endpoints
  AGENTS: '/api/agents',
  AGENT: (id: string) => `/api/agents/${id}`,
  AGENT_INTERACT: (id: string) => `/api/agents/${id}/interact`,
  AGENT_OBSERVE: (id: string) => `/api/agents/${id}/observe`,
  AGENT_CONTROL: (id: string) => `/api/agents/${id}/control`,
  AGENT_UPDATE: (id: string) => `/api/agents/${id}/update`,  // PATCH

  // Environment endpoints
  ENVIRONMENTS: '/api/environments',
  ENVIRONMENT: (id: string) => `/api/environments/${id}`,
  ENVIRONMENT_UPDATE: (id: string) => `/api/environments/${id}/update`,  // PATCH
  ENVIRONMENT_DELETE: (id: string) => `/api/environments/${id}`,
  ENVIRONMENT_OBSERVE: (id: string) => `/api/environments/${id}/observe`,
  ENVIRONMENT_LOCATIONS: (environmentId: string) => `/api/environments/${environmentId}/locations`,
  ENVIRONMENT_LOCATION: (environmentId: string, locationId: string) => `/api/environments/${environmentId}/locations/${locationId}`,
  ENVIRONMENT_CONNECTIONS: (environmentId: string) => `/api/environments/${environmentId}/connections`,
  ENVIRONMENT_CONNECTION: (environmentId: string, connectionId: string) => `/api/environments/${environmentId}/connections/${connectionId}`,

  // Story endpoints
  STORIES: '/api/stories',
  STORY: (id: string) => `/api/stories/${id}`,
  STORY_UPDATE: (id: string) => `/api/stories/${id}/update`,  // PATCH
  STORY_OBSERVE: (id: string) => `/api/stories/${id}/observe`,

  // Utility endpoints
  CLEAR_STORAGE: '/api/clear',
  AGENT_LOCATIONS: (agentId: string) => `/api/agents/${agentId}/locations`,
  AGENT_LOCATION: (agentId: string, locationId: string) => `/api/agents/${agentId}/locations/${locationId}`,
  SIMULATION_STATE: '/api/simulation/state',
  SIMULATION_CONTROL: '/api/simulation/control',
  SIMULATION_LOGS: '/api/simulation/logs',
  SIMULATION_ACTION: '/api/simulation/action',

  // World endpoints
  LOCATIONS: '/api/locations',
  LOCATION_DETAILS: (id: string) => `/api/locations/${id}`,
  CONNECTIONS: '/api/connections',
  CONNECTION_DETAILS: (id: string) => `/api/connections/${id}`,
};
