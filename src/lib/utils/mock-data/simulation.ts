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
    timestamp: timestamp.toISOString(),
    agentId: 'agent-1',
    action: 'MOVE',
    content: `Moved to ${i % 2 === 0 ? 'office-1' : 'cafe-1'}`,
    metadata: {
      location: i % 2 === 0 ? 'office-1' : 'cafe-1',
      rawContent: {
        location: i % 2 === 0 ? 'office-1' : 'cafe-1'
      }
    }
  })),

  // Conversations
  ...timestamps.slice(20, 40).map((timestamp, i) => ({
    id: `log-talk-${i}`,
    timestamp: timestamp.toISOString(),
    agentId: 'agent-2',
    action: 'TALK',
    content: [
      "Let's review the latest design updates.",
      "How's the new feature coming along?",
      "Great progress on the UI!",
      "Should we schedule a team meeting?",
      "I love the new color scheme!"
    ][i % 5],
    metadata: {
      rawContent: {
        message: [
          "Let's review the latest design updates.",
          "How's the new feature coming along?",
          "Great progress on the UI!",
          "Should we schedule a team meeting?",
          "I love the new color scheme!"
        ][i % 5]
      }
    }
  })),

  // Mixed activities for agent-3
  ...timestamps.slice(40, 60).map((timestamp, i) => ({
    id: `log-mixed-${i}`,
    timestamp: timestamp.toISOString(),
    agentId: 'agent-3',
    action: i % 2 === 0 ? 'MOVE' : 'TALK',
    content: i % 2 === 0
      ? `Moved to ${['office-1', 'cafe-1', 'outdoor-1'][i % 3]}`
      : "Let's discuss the project timeline.",
    metadata: i % 2 === 0
      ? {
          location: ['office-1', 'cafe-1', 'outdoor-1'][i % 3],
          rawContent: {
            location: ['office-1', 'cafe-1', 'outdoor-1'][i % 3]
          }
        }
      : {
          rawContent: {
            message: "Let's discuss the project timeline."
          }
        }
  })),

  // Recent activities
  ...timestamps.slice(-20).map((timestamp, i) => ({
    id: `log-recent-${i}`,
    timestamp: timestamp.toISOString(),
    agentId: ['agent-1', 'agent-2', 'agent-3', 'agent-4', 'agent-5'][i % 5],
    action: i % 2 === 0 ? 'MOVE' : 'TALK',
    content: i % 2 === 0
      ? `Moved to ${['office-1', 'cafe-1', 'outdoor-1', 'office-2'][i % 4]}`
      : [
          'Great idea!',
          "Let's collaborate on this.",
          "I'll help with that.",
          'When should we meet?',
          'The results look promising!'
        ][i % 5],
    metadata: i % 2 === 0
      ? {
          location: ['office-1', 'cafe-1', 'outdoor-1', 'office-2'][i % 4],
          rawContent: {
            location: ['office-1', 'cafe-1', 'outdoor-1', 'office-2'][i % 4]
          }
        }
      : {
          rawContent: {
            message: [
              'Great idea!',
              "Let's collaborate on this.",
              "I'll help with that.",
              'When should we meet?',
              'The results look promising!'
            ][i % 5]
          }
        }
  }))
];

// Add some random variations to timestamps to make them more realistic
mockLogs.forEach(log => {
  const base = new Date(log.timestamp);
  log.timestamp = new Date(base.getTime() + Math.random() * 60000).toISOString(); // Add up to 1 minute random offset
});

// Sort logs by timestamp
mockLogs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());