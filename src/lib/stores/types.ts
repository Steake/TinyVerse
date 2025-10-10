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
  group?: string | null;
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
  zone?: 'interior' | 'exterior' | 'transit';
  level?: number;
  features?: LocationFeature[];
}

export interface Connection {
  id: string;
  source: string;
  target: string;
  type: 'path' | 'door' | 'portal' | 'stairs';
  label?: string;
  isDirectional?: boolean;
}

export interface LocationFeature {
  id: string;
  label: string;
  type:
    | 'whiteboard'
    | 'meeting-table'
    | 'desk-bank'
    | 'garden'
    | 'entrance'
    | 'lounge'
    | 'display'
    | 'other';
  x: number;
  y: number;
  notes?: string;
}

export interface SimulationLogMetadata {
  rendering?: string;
  target?: string;
  rawContent?: Record<string, unknown>;
  source?: string;
  kind?: string;
  location?: string;
  title?: string;
  message?: string;
  [key: string]: unknown;
}

export interface SimulationLog {
  id: string;
  timestamp: string;
  agentId?: string;
  agentName?: string;
  action: string;
  content: string;
  metadata?: SimulationLogMetadata;
}

export interface MentalFaculty {
  id: string;
  agent_id: string;
  key: string;
  name: string;
  description: string;
  type: 'memory' | 'grounding' | 'tool-use';
  is_active: boolean;
  parameters: FacultyParameter[];
  created_at: string;
}

export interface FacultyParameter {
  id: string;
  name: string;
  description?: string;
  type: 'number' | 'boolean' | 'range' | 'select' | 'multi-select';
  value: number | boolean | string | string[] | null;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ value: string; label: string }>;
}

export interface MentalFacultyDefinition {
  key: string;
  name: string;
  description: string;
  type: 'memory' | 'grounding' | 'tool-use';
  parameters: FacultyParameter[];
}

export interface ToolDefinition {
  key: string;
  name: string;
  description: string;
  capabilities: string[];
  parameters: FacultyParameter[];
}

export interface ToolInstance {
  id: string;
  agent_id: string;
  key: string;
  name: string;
  description: string;
  capabilities: string[];
  created_at: string;
}

export interface MemoryEntry {
  content: string;
  type?: string;
  role?: string;
  simulation_timestamp?: string;
  [key: string]: unknown;
}
