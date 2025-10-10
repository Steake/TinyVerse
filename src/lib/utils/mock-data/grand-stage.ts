import type { Agent } from '../../stores/types';
import { mockAgents } from './agents';

export interface StageState {
  time: Date;
  weather: 'sunny' | 'rainy' | 'cloudy';
  temperature: number;
  lighting: number; // 0-100
  ambientNoise: number; // 0-100
  activeAgents: string[]; // Agent IDs currently in scene
  agentPositions: Record<string, { x: number; y: number }>;
  currentInteractions: Interaction[];
}

export interface Interaction {
  id: string;
  type: 'conversation' | 'activity' | 'reaction';
  participants: string[]; // Agent IDs
  content: string;
  startTime: Date;
  duration: number; // in milliseconds
  mood: 'positive' | 'neutral' | 'negative';
}

export const initialStageState: StageState = {
  time: new Date('2024-02-20T09:00:00'),
  weather: 'sunny',
  temperature: 22,
  lighting: 80,
  ambientNoise: 30,
  activeAgents: [],
  agentPositions: {},
  currentInteractions: []
};

export const demoInteractions: Interaction[] = [
  {
    id: 'int-2',
    type: 'conversation',
    participants: [mockAgents[1].id, mockAgents[2].id],
    content: "I've found some interesting patterns in the data.",
    startTime: new Date('2024-02-20T09:15:00'),
    duration: 240000,
    mood: 'positive'
  },
  {
    id: 'int-3',
    type: 'activity',
    participants: [mockAgents[0].id],
    content: "Working on code optimization",
    startTime: new Date('2024-02-20T09:30:00'),
    duration: 1800000,
    mood: 'neutral'
  },
  {
    id: 'int-4',
    type: 'reaction',
    participants: [mockAgents[2].id],
    content: "😄 Excited about the new feature!",
    startTime: new Date('2024-02-20T09:45:00'),
    duration: 5000,
    mood: 'positive'
  }
];

export const demoSchedule = [
  {
    time: '09:00',
    events: [
      { agentId: mockAgents[0].id, action: 'arrive', location: 'office' },
      { agentId: mockAgents[1].id, action: 'arrive', location: 'office' }
    ]
  },
  {
    time: '09:15',
    events: [
      { agentId: mockAgents[2].id, action: 'arrive', location: 'office' },
      { agentId: mockAgents[0].id, action: 'start_work', location: 'desk' }
    ]
  },
  {
    time: '10:00',
    events: [
      { agentId: mockAgents[0].id, action: 'meeting', location: 'conference' },
      { agentId: mockAgents[1].id, action: 'meeting', location: 'conference' }
    ]
  }
];