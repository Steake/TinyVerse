export interface AgentGroup {
  id: string;
  name: string;
}

export interface Agent {
  id: string;
  name: string;
  age: number;
  occupation: string;
  occupation_description?: string;
  nationality?: string;
  country_of_residence?: string;
  personality_traits: string[];
  professional_interests: string[];
  personal_interests: string[];
  skills: Skill[];
  backstory?: string;
  created_at?: Date;
  // UI-only fields (not sent to backend)
  routines?: Routine[];
  relationships?: Relationship[];
  profilePicture?: string;
  emoji?: string;
  group?: string;
  x?: number;
  y?: number;
}

export interface Routine {
  id: string;
  name: string;
  schedule: string;
  location: string;
  duration: number;
}

export interface Skill {
  name: string;
  level: number; // 0-10 to match backend
}

export interface Relationship {
  targetId: string;
  type: 'friend' | 'colleague' | 'family' | 'rival';
  strength: number;
  description: string;
}

export interface Location {
  id: string;
  name: string;
  type: 'room' | 'outdoor' | 'special';
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
  image?: string;
}

export interface Connection {
  id: string;
  source: string;
  target: string;
  type: 'path' | 'door' | 'portal';
}

export interface SimulationLog {
  id: string;
  timestamp: Date;
  agentId: string;
  action: 'MOVE' | 'TALK';
  data: any;
}

export interface MentalFaculty {
  id: string;
  name: string;
  description: string;
  type: 'memory' | 'grounding' | 'tool-use';
  isActive: boolean;
  parameters: FacultyParameter[];
}

export interface FacultyParameter {
  id: string;
  name: string;
  description: string;
  type: 'number' | 'boolean' | 'range';
  value: number | boolean;
  min?: number;
  max?: number;
  step?: number;
}