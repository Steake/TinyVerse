import type { MentalFaculty } from '../../stores/types';

export const mockFaculties: MentalFaculty[] = [
  {
    id: 'memory-recall',
    name: 'Memory Recall',
    description: 'Ability to access and utilize past experiences',
    type: 'memory',
    isActive: true,
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
    name: 'Local Grounding',
    description: 'Awareness of current environment and context',
    type: 'grounding',
    isActive: true,
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