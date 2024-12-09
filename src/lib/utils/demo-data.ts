import type { Agent } from '../stores/agents';

export const demoAgents: Agent[] = [
  {
    id: 'a1',
    name: 'Emma Chen',
    age: 28,
    occupation: 'Software Engineer',
    occupationDescription: 'Full-stack developer specializing in AI and web technologies',
    nationality: 'Chinese-Canadian',
    countryOfResidence: 'Canada',
    routines: [],
    personalityTraits: ['analytical', 'creative', 'ambitious'],
    professionalInterests: ['artificial intelligence', 'web development', 'cloud computing'],
    personalInterests: ['photography', 'hiking', 'piano'],
    skills: [
      { name: 'JavaScript', level: 5 },
      { name: 'Python', level: 4 },
      { name: 'Machine Learning', level: 3 }
    ],
    relationships: [
      {
        targetId: 'a2',
        type: 'colleague',
        strength: 4,
        description: 'Works together on the AI team'
      },
      {
        targetId: 'a3',
        type: 'friend',
        strength: 5,
        description: 'Regular hiking buddies'
      }
    ],
    backstory: '<p>Born in Vancouver to Chinese parents, Emma developed a passion for technology at an early age. She graduated from UBC with honors in Computer Science and now leads an AI research team.</p>',
    emoji: '👩‍💻'
  },
  {
    id: 'a2',
    name: 'James Wilson',
    age: 32,
    occupation: 'Data Scientist',
    occupationDescription: 'Specializes in machine learning and data analytics',
    nationality: 'British',
    countryOfResidence: 'Canada',
    routines: [],
    personalityTraits: ['methodical', 'curious', 'detail-oriented'],
    professionalInterests: ['machine learning', 'data visualization', 'statistics'],
    personalInterests: ['chess', 'rock climbing', 'science fiction'],
    skills: [
      { name: 'Python', level: 5 },
      { name: 'Statistics', level: 5 },
      { name: 'Deep Learning', level: 4 }
    ],
    relationships: [
      {
        targetId: 'a1',
        type: 'colleague',
        strength: 4,
        description: 'Collaborates on AI projects'
      }
    ],
    backstory: '<p>Originally from London, James moved to Canada to pursue advanced research in AI. His competitive nature drives him to push boundaries in the field.</p>',
    emoji: '👨‍🔬'
  },
  {
    id: 'a3',
    name: 'Sofia Rodriguez',
    age: 29,
    occupation: 'Environmental Scientist',
    occupationDescription: 'Research focus on climate change and ecosystem preservation',
    nationality: 'Mexican',
    countryOfResidence: 'Canada',
    routines: [],
    personalityTraits: ['passionate', 'outgoing', 'determined'],
    professionalInterests: ['climate science', 'conservation', 'sustainable development'],
    personalInterests: ['hiking', 'photography', 'gardening'],
    skills: [
      { name: 'Environmental Analysis', level: 5 },
      { name: 'GIS', level: 4 },
      { name: 'Research', level: 4 }
    ],
    relationships: [
      {
        targetId: 'a1',
        type: 'friend',
        strength: 5,
        description: 'Share outdoor adventures'
      }
    ],
    backstory: '<p>Sofia came to Canada for her Masters in Environmental Science and stayed after falling in love with the country\'s natural beauty. She leads conservation projects in British Columbia.</p>',
    emoji: '👩‍🔬'
  }
];

export function initializeDemoData(agentStore: any) {
  demoAgents.forEach(agent => {
    agentStore.addAgent(agent);
  });
}