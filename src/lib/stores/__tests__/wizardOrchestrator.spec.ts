import { describe, expect, it } from 'vitest';
import { normalizeJsonInput, parseJson } from '../../utils/jsonParsing';

describe('wizard JSON normalization helpers', () => {
  it('repairs code-fenced JSON with comments and trailing commas', () => {
    const sample = [
      '```json',
      '{',
      '  agents: [',
      '    {',
      '      name: "Test Agent",',
      '      age: "34",',
      '      skills: [',
      '        {name: "persuasion", level: 4},',
      '      ],',
      '      /* persona metadata */',
      '      emoji: "🎯"',
      '    }',
      '  ],',
      '  locations: [',
      '    {',
      '      name: "Call Floor",',
      '      description: "A busy room",',
      '    }',
      '  ],',
      '}',
      '```'
    ].join('\n');

    const repaired = normalizeJsonInput(sample);
    const parsed = parseJson<any>(repaired);

    expect(parsed).toBeTruthy();
    expect(parsed?.agents?.[0]?.name).toBe('Test Agent');
    expect(parsed?.locations?.[0]?.name).toBe('Call Floor');
  });

  it('handles already valid JSON without modification', () => {
    const sample = '{"value": 42}';
    const parsed = parseJson<{ value: number }>(sample);
    expect(parsed).toEqual({ value: 42 });
  });
});
