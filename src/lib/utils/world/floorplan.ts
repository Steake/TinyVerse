import type { Connection, Location, LocationFeature } from '../../stores/types';

type FloorplanSeedOptions = {
  seed?: string;
  scale?: number;
  origin?: { x: number; y: number };
  mirror?: 'none' | 'horizontal' | 'vertical';
};

type FloorplanDefinition = {
  name: string;
  locations: Location[];
  connections: Connection[];
};

type FeatureBlueprint = Omit<LocationFeature, 'x' | 'y'> & {
  offsetX: number;
  offsetY: number;
};

function hashSeed(seed: string): number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i += 1) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

function mulberry32(a: number): () => number {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function applyMirror(
  x: number,
  y: number,
  areaWidth: number,
  areaHeight: number,
  mirror: FloorplanSeedOptions['mirror'],
  elementWidth: number,
  elementHeight: number
) {
  if (mirror === 'horizontal') {
    return { x: areaWidth - x - elementWidth, y };
  }
  if (mirror === 'vertical') {
    return { x, y: areaHeight - y - elementHeight };
  }
  return { x, y };
}

export function generateShowcaseFloorplan(options: FloorplanSeedOptions = {}): FloorplanDefinition {
  const scale = options.scale ?? 1;
  const origin = options.origin ?? { x: 80, y: 80 };
  const seedValue = hashSeed(options.seed ?? 'tinyverse');
  const random = mulberry32(seedValue);

  const campusWidth = 920 * scale;
  const campusHeight = 620 * scale;

  const mirrorModes: FloorplanSeedOptions['mirror'][] = ['none', 'horizontal', 'vertical'];
  const mirror = options.mirror ?? mirrorModes[Math.floor(random() * mirrorModes.length)];

  const baseLocations: Array<Omit<Location, 'x' | 'y' | 'features'> & { x: number; y: number; features?: FeatureBlueprint[] }> = [
    {
      id: 'atrium-lobby',
      name: 'Atrium Lobby',
      type: 'special',
      description: 'Double-height lobby with reception and lounge seating',
      zone: 'interior',
      level: 0,
      width: 260 * scale,
      height: 180 * scale,
      x: 80 * scale,
      y: 80 * scale,
      features: [
        { id: 'atrium-lobby-reception', label: 'Reception Desk', type: 'display', offsetX: 0.5, offsetY: 0.2, notes: 'Central check-in' },
        { id: 'atrium-lobby-lounge', label: 'Lounge Seating', type: 'lounge', offsetX: 0.7, offsetY: 0.65 }
      ]
    },
    {
      id: 'collaboration-hub',
      name: 'Collaboration Hub',
      type: 'room',
      description: 'Modular space with writable walls, huddle tables and screens',
      zone: 'interior',
      level: 0,
      width: 280 * scale,
      height: 170 * scale,
      x: 380 * scale,
      y: 90 * scale,
      features: [
        { id: 'collaboration-hub-whiteboard', label: 'Strategy Whiteboard', type: 'whiteboard', offsetX: 0.18, offsetY: 0.18, notes: 'North wall' },
        { id: 'collaboration-hub-table', label: 'Project Table', type: 'meeting-table', offsetX: 0.52, offsetY: 0.55 }
      ]
    },
    {
      id: 'innovation-lab',
      name: 'Innovation Lab',
      type: 'room',
      description: 'Prototype benches with tools and rapid iteration pods',
      zone: 'interior',
      level: 0,
      width: 240 * scale,
      height: 160 * scale,
      x: 720 * scale,
      y: 110 * scale,
      features: [
        { id: 'innovation-lab-desks', label: 'Maker Desks', type: 'desk-bank', offsetX: 0.4, offsetY: 0.38 },
        { id: 'innovation-lab-display', label: 'Demo Showcase', type: 'display', offsetX: 0.74, offsetY: 0.7 }
      ]
    },
    {
      id: 'operations-bridge',
      name: 'Operations Bridge',
      type: 'room',
      description: 'Operations center with tiered seating and conference controls',
      zone: 'interior',
      level: 1,
      width: 260 * scale,
      height: 140 * scale,
      x: 140 * scale,
      y: 320 * scale,
      features: [
        { id: 'operations-bridge-wall', label: 'Wall Display', type: 'display', offsetX: 0.5, offsetY: 0.22 }
      ]
    },
    {
      id: 'war-room',
      name: 'War Room',
      type: 'room',
      description: 'Private enclave for rapid response with tactical whiteboards',
      zone: 'interior',
      level: 1,
      width: 210 * scale,
      height: 140 * scale,
      x: 440 * scale,
      y: 320 * scale,
      features: [
        { id: 'war-room-whiteboard', label: 'Whiteboard Wall', type: 'whiteboard', offsetX: 0.26, offsetY: 0.15 }
      ]
    },
    {
      id: 'outdoor-quad',
      name: 'Campus Courtyard',
      type: 'outdoor',
      description: 'Plaza with biophilic landscape, water feature, and seating rings',
      zone: 'exterior',
      level: 0,
      width: 340 * scale,
      height: 240 * scale,
      x: 720 * scale,
      y: 340 * scale,
      features: [
        { id: 'outdoor-quad-garden', label: 'Garden Grove', type: 'garden', offsetX: 0.35, offsetY: 0.5 },
        { id: 'outdoor-quad-stage', label: 'Open-Air Stage', type: 'display', offsetX: 0.72, offsetY: 0.22 }
      ]
    }
  ];

  const locations: Location[] = baseLocations.map(location => {
    const { x, y } = applyMirror(
      location.x,
      location.y,
      campusWidth,
      campusHeight,
      mirror,
      location.width,
      location.height
    );
    const adjustedX = origin.x + x;
    const adjustedY = origin.y + y;
    const features = (location.features ?? []).map((feature, index) => {
      const { offsetX, offsetY, ...rest } = feature;
      return {
        ...rest,
        id: feature.id ?? `${location.id}-feature-${index}`,
        x: adjustedX + offsetX * location.width,
        y: adjustedY + offsetY * location.height
      } satisfies LocationFeature;
    });

    return {
      ...location,
      x: adjustedX,
      y: adjustedY,
      features
    };
  });

  const connections: Connection[] = [
    {
      id: 'conn-atrium-collab',
      source: 'atrium-lobby',
      target: 'collaboration-hub',
      type: 'door',
      label: 'Glass Corridor'
    },
    {
      id: 'conn-collab-innovation',
      source: 'collaboration-hub',
      target: 'innovation-lab',
      type: 'path',
      label: 'Innovation Walkway'
    },
    {
      id: 'conn-atrium-operations',
      source: 'atrium-lobby',
      target: 'operations-bridge',
      type: 'stairs',
      label: 'Grand Stair'
    } as Connection,
    {
      id: 'conn-operations-war',
      source: 'operations-bridge',
      target: 'war-room',
      type: 'door',
      label: 'Secure Vestibule'
    },
    {
      id: 'conn-collab-outdoor',
      source: 'collaboration-hub',
      target: 'outdoor-quad',
      type: 'portal',
      label: 'Garden Passage'
    },
    {
      id: 'conn-war-outdoor',
      source: 'war-room',
      target: 'outdoor-quad',
      type: 'path',
      label: 'Observation Deck'
    }
  ];

  return {
    name: 'Tinyverse Showcase Campus',
    locations,
    connections
  };
}

export type { FloorplanDefinition, FloorplanSeedOptions };
