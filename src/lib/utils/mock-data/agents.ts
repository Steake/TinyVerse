import type { Agent } from '../../stores/types';

export const mockAgents: Agent[] = [
  {
    id: 'agent-1',
    name: 'Emma Chen',
    age: 28,
    occupation: 'Software Engineer',
    occupationDescription: 'Full-stack developer specializing in AI and web technologies',
    nationality: 'Chinese-Canadian',
    countryOfResidence: 'Canada',
    routines: [
      {
        id: 'routine-1',
        name: 'Morning Coffee',
        schedule: '09:00',
        location: 'cafe-1',
        duration: 30
      },
      {
        id: 'routine-2',
        name: 'Team Meeting',
        schedule: '10:00',
        location: 'office-1',
        duration: 60
      }
    ],
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
        targetId: 'agent-2',
        type: 'colleague',
        strength: 4,
        description: 'Close collaboration on AI projects'
      },
      {
        targetId: 'agent-3',
        type: 'friend',
        strength: 5,
        description: 'Regular hiking buddy and photography enthusiast'
      },
      {
        targetId: 'agent-4',
        type: 'rival',
        strength: 3,
        description: 'Competing for the same promotion'
      }
    ],
    backstory: '<p>Born in Vancouver to Chinese parents, Emma developed a passion for technology at an early age.</p>',
    emoji: '👩‍💻'
  },
  {
    id: 'agent-2',
    name: 'Marcus Rodriguez',
    age: 35,
    occupation: 'UX Designer',
    occupationDescription: 'Senior UX designer focusing on user research and interaction design',
    nationality: 'Mexican',
    countryOfResidence: 'Canada',
    routines: [
      {
        id: 'routine-3',
        name: 'Design Review',
        schedule: '14:00',
        location: 'office-2',
        duration: 90
      }
    ],
    personalityTraits: ['empathetic', 'observant', 'collaborative'],
    professionalInterests: ['user research', 'interaction design', 'accessibility'],
    personalInterests: ['sketching', 'salsa dancing', 'cooking'],
    skills: [
      { name: 'Figma', level: 5 },
      { name: 'User Research', level: 4 },
      { name: 'Prototyping', level: 5 }
    ],
    relationships: [
      {
        targetId: 'agent-1',
        type: 'colleague',
        strength: 4,
        description: 'Collaborates on product design and AI interfaces'
      },
      {
        targetId: 'agent-5',
        type: 'family',
        strength: 5,
        description: 'Married to Sarah'
      },
      {
        targetId: 'agent-3',
        type: 'friend',
        strength: 3,
        description: 'Met through company social events'
      }
    ],
    backstory: '<p>Started his career as a graphic designer before transitioning to UX design.</p>',
    emoji: '👨‍🎨'
  },
  {
    id: 'agent-3',
    name: 'Aisha Patel',
    age: 31,
    occupation: 'Product Manager',
    occupationDescription: 'Leading product strategy and development for AI-powered solutions',
    nationality: 'Indian',
    countryOfResidence: 'Canada',
    routines: [
      {
        id: 'routine-4',
        name: 'Sprint Planning',
        schedule: '11:00',
        location: 'office-1',
        duration: 120
      }
    ],
    personalityTraits: ['strategic', 'diplomatic', 'energetic'],
    professionalInterests: ['product strategy', 'team leadership', 'agile methodologies'],
    personalInterests: ['hiking', 'yoga', 'travel photography'],
    skills: [
      { name: 'Product Strategy', level: 5 },
      { name: 'Agile Management', level: 4 },
      { name: 'Data Analysis', level: 3 }
    ],
    relationships: [
      {
        targetId: 'agent-1',
        type: 'friend',
        strength: 5,
        description: 'Share passion for hiking and photography'
      },
      {
        targetId: 'agent-2',
        type: 'friend',
        strength: 3,
        description: 'Regular lunch buddy'
      },
      {
        targetId: 'agent-4',
        type: 'rival',
        strength: 2,
        description: 'Competing product visions'
      }
    ],
    backstory: '<p>Moved to Canada for her MBA and fell in love with the tech industry.</p>',
    emoji: '👩‍💼'
  },
  {
    id: 'agent-4',
    name: 'David Chen',
    age: 40,
    occupation: 'Engineering Manager',
    occupationDescription: 'Leading the AI and machine learning engineering teams',
    nationality: 'Canadian',
    countryOfResidence: 'Canada',
    routines: [
      {
        id: 'routine-5',
        name: 'Team Sync',
        schedule: '09:30',
        location: 'office-1',
        duration: 45
      }
    ],
    personalityTraits: ['competitive', 'perfectionist', 'ambitious'],
    professionalInterests: ['team leadership', 'AI architecture', 'performance optimization'],
    personalInterests: ['chess', 'mountain biking', 'wine tasting'],
    skills: [
      { name: 'Team Leadership', level: 5 },
      { name: 'System Architecture', level: 5 },
      { name: 'Machine Learning', level: 4 }
    ],
    relationships: [
      {
        targetId: 'agent-1',
        type: 'rival',
        strength: 3,
        description: 'Professional competition for leadership roles'
      },
      {
        targetId: 'agent-3',
        type: 'rival',
        strength: 2,
        description: 'Disagreements over product direction'
      },
      {
        targetId: 'agent-5',
        type: 'friend',
        strength: 4,
        description: 'Regular chess partners'
      }
    ],
    backstory: '<p>Started as a developer and worked his way up to management, known for his competitive nature.</p>',
    emoji: '👨‍💼'
  },
  {
    id: 'agent-5',
    name: 'Sarah Rodriguez',
    age: 33,
    occupation: 'Data Scientist',
    occupationDescription: 'Specializing in machine learning and predictive analytics',
    nationality: 'Canadian',
    countryOfResidence: 'Canada',
    routines: [
      {
        id: 'routine-6',
        name: 'Data Analysis',
        schedule: '10:30',
        location: 'office-2',
        duration: 120
      }
    ],
    personalityTraits: ['analytical', 'patient', 'detail-oriented'],
    professionalInterests: ['machine learning', 'data visualization', 'statistical analysis'],
    personalInterests: ['gardening', 'cooking', 'classical music'],
    skills: [
      { name: 'Python', level: 5 },
      { name: 'Machine Learning', level: 5 },
      { name: 'Statistics', level: 4 }
    ],
    relationships: [
      {
        targetId: 'agent-2',
        type: 'family',
        strength: 5,
        description: 'Married to Marcus'
      },
      {
        targetId: 'agent-4',
        type: 'friend',
        strength: 4,
        description: 'Share interest in AI and machine learning'
      },
      {
        targetId: 'agent-1',
        type: 'colleague',
        strength: 3,
        description: 'Collaboration on AI features'
      }
    ],
    backstory: '<p>Met Marcus at a tech conference and shares his passion for combining creativity with technology.</p>',
    emoji: '👩‍🔬'
  }
];