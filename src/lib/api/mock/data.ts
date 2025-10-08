import type { Agent, Location, Connection, SimulationLog } from '../../stores/types';

export const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'Alice Chen',
    age: 28,
    occupation: 'Software Engineer',
    occupation_description: 'Full-stack developer specializing in web technologies',
    nationality: 'Chinese',
    country_of_residence: 'Canada',
    routines: [],
    personality_traits: ['curious', 'analytical', 'creative'],
    professional_interests: ['AI', 'web development', 'system design'],
    personal_interests: ['hiking', 'photography', 'cooking'],
    skills: [
      { name: 'JavaScript', level: 5 },
      { name: 'Python', level: 4 }
    ],
    relationships: [],
    backstory: '<p>Born in Shanghai, moved to Vancouver for studies...</p>',
    emoji: '👩‍💻'
  },
  {
    id: '2',
    name: 'Marcus Silva',
    age: 35,
    occupation: 'Chef',
    occupation_description: 'Head chef at a fusion restaurant',
    nationality: 'Brazilian',
    country_of_residence: 'Canada',
    routines: [],
    personality_traits: ['passionate', 'creative', 'detail-oriented'],
    professional_interests: ['culinary arts', 'food science', 'sustainability'],
    personal_interests: ['travel', 'music', 'gardening'],
    skills: [
      { name: 'Cooking', level: 5 },
      { name: 'Team Management', level: 4 }
    ],
    relationships: [],
    backstory: '<p>Grew up in São Paulo, discovered his passion for cooking...</p>',
    emoji: '👨‍🍳'
  }
];

export const mockLocations: Location[] = [
  {
    id: '1',
    name: 'Tech Hub',
    type: 'room',
    description: 'A modern co-working space with standing desks and whiteboards',
    x: 100,
    y: 100,
    width: 200,
    height: 150
  },
  {
    id: '2',
    name: 'City Park',
    type: 'outdoor',
    description: 'A peaceful park with walking trails and benches',
    x: 400,
    y: 300,
    width: 300,
    height: 200
  }
];

export const mockConnections: Connection[] = [
  {
    id: '1',
    source: '1',
    target: '2',
    type: 'path'
  }
];

export const mockLogs: SimulationLog[] = [
  {
    id: '1',
    timestamp: new Date(),
    agentId: '1',
    action: 'MOVE',
    data: { locationId: '2' }
  }
];