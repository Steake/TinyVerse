import type { SimulationLog } from '../../stores/types';

// Generate timestamps for the last 24 hours
const getRecentTimestamps = (count: number) => {
  const timestamps = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    timestamps.push(new Date(now.getTime() - (i * 15 * 60 * 1000))); // 15-minute intervals
  }
  return timestamps.reverse();
};

const timestamps = getRecentTimestamps(96); // 24 hours of 15-minute intervals

export const mockLogs: SimulationLog[] = [
  // Movement patterns
  ...timestamps.slice(0, 20).map((timestamp, i) => ({
    id: `log-move-${i}`,
    timestamp,
    agentId: 'agent-1',
    action: 'MOVE',
    data: { location: i % 2 === 0 ? 'office-1' : 'cafe-1' }
  })),

  // Conversations
  ...timestamps.slice(20, 40).map((timestamp, i) => ({
    id: `log-talk-${i}`,
    timestamp,
    agentId: 'agent-2',
    action: 'TALK',
    data: { 
      message: [
        "Let's review the latest design updates.",
        "How's the new feature coming along?",
        "Great progress on the UI!",
        "Should we schedule a team meeting?",
        "I love the new color scheme!"
      ][i % 5]
    }
  })),

  // Mixed activities for agent-3
  ...timestamps.slice(40, 60).map((timestamp, i) => ({
    id: `log-mixed-${i}`,
    timestamp,
    agentId: 'agent-3',
    action: i % 2 === 0 ? 'MOVE' : 'TALK',
    data: i % 2 === 0 
      ? { location: ['office-1', 'cafe-1', 'outdoor-1'][i % 3] }
      : { message: "Let's discuss the project timeline." }
  })),

  // Recent activities
  ...timestamps.slice(-20).map((timestamp, i) => ({
    id: `log-recent-${i}`,
    timestamp,
    agentId: ['agent-1', 'agent-2', 'agent-3', 'agent-4', 'agent-5'][i % 5],
    action: i % 2 === 0 ? 'MOVE' : 'TALK',
    data: i % 2 === 0
      ? { location: ['office-1', 'cafe-1', 'outdoor-1', 'office-2'][i % 4] }
      : { message: [
          "Great idea!",
          "Let's collaborate on this.",
          "I'll help with that.",
          "When should we meet?",
          "The results look promising!"
        ][i % 5] }
  }))
];

// Add some random variations to timestamps to make them more realistic
mockLogs.forEach(log => {
  log.timestamp = new Date(log.timestamp.getTime() + Math.random() * 60000); // Add up to 1 minute random offset
});

// Sort logs by timestamp
mockLogs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());