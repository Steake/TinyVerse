import type { MentalFaculty } from '../../stores/types';

export const mockFaculties: MentalFaculty[] = [
  {
    id: 'memory-recall',
    agent_id: 'mock-agent-1',
    key: 'memory_recall',
    name: 'Memory Recall',
    description: 'Ability to access and utilize past experiences',
    type: 'memory',
    is_active: true,
    created_at: '2024-01-01T00:00:00.000Z',
    parameters: [
      {
        id: 'lookback-length',
        name: 'Lookback Length',
        description: 'Number of past events to consider',
        type: 'range',
        value: 10,
        min: 1,
        max: 50,
        step: 1
      },
      {
        id: 'memory-strength',
        name: 'Memory Strength',
        description: 'Impact of memories on decision making',
        type: 'range',
        value: 0.7,
        min: 0,
        max: 1,
        step: 0.1
      }
    ]
  },
  {
    id: 'local-grounding',
    agent_id: 'mock-agent-1',
    key: 'local_grounding',
    name: 'Local Grounding',
    description: 'Awareness of current environment and context',
    type: 'grounding',
    is_active: true,
    created_at: '2024-01-02T00:00:00.000Z',
    parameters: [
      {
        id: 'perception-radius',
        name: 'Perception Radius',
        description: 'Range of environmental awareness',
        type: 'range',
        value: 5,
        min: 1,
        max: 20,
        step: 1
      },
      {
        id: 'context-sensitivity',
        name: 'Context Sensitivity',
        description: 'Responsiveness to environmental changes',
        type: 'boolean',
        value: true
      }
    ]
  }
];