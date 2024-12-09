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

  // Initialize world
  mockLocations.forEach(location => {
    worldStore.addLocation(location);
  });
  mockConnections.forEach(connection => {
    worldStore.addConnection(connection);
  });

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