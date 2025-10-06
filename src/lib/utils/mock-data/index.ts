import { mockAgents } from './agents';
import { mockLocations, mockConnections } from './locations';
import { mockLogs } from './simulation';
import { mockFaculties } from './faculties';

export function initializeMockData(stores: {
  agentStore: any;
  worldStore: any;
  simulationStore: any;
  facultyStore: any;
}) {
  const { agentStore, worldStore, simulationStore, facultyStore } = stores;

  // Initialize agents
  mockAgents.forEach(agent => {
    agentStore.addAgent(agent);
  });

  // Initialize world - directly update the store
  worldStore.update((state: any) => ({
    ...state,
    locations: mockLocations,
    connections: mockConnections
  }));

  // Initialize simulation logs
  mockLogs.forEach(log => {
    simulationStore.addLog(log);
  });

  // Initialize faculties
  mockFaculties.forEach(faculty => {
    facultyStore.addFaculty(faculty);
  });
}

export { mockAgents } from './agents';
export { mockLocations, mockConnections } from './locations';
export { mockLogs } from './simulation';
export { mockFaculties } from './faculties';