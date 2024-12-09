export interface AgentGroup {
  id: string;
  name: string;
}

export interface Agent {
  id: string;
  name: string;
  age: number;
  occupation: string;
  occupationDescription: string;
  nationality: string;
  countryOfResidence: string;
  routines: Routine[];
  personalityTraits: string[];
  professionalInterests: string[];
  personalInterests: string[];
  skills: Skill[];
  relationships: Relationship[];
  backstory: string;
  profilePicture?: string;
  emoji: string;
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
  level: number;
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