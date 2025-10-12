import { expect, afterEach, vi } from 'vitest';

// Cleanup after each test (only when a DOM is available)
afterEach(async () => {
  if (typeof document !== 'undefined') {
    const { cleanup } = await import('@testing-library/svelte');
    cleanup();
  }
});

// Minimal polyfills for Node test environment when DOM is not available
if (typeof globalThis.SharedArrayBuffer === 'undefined') {
  // Not actually shared, but sufficient for libraries that only check for existence
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  globalThis.SharedArrayBuffer = ArrayBuffer as any;
}

// Some libs may try to use the WHATWG URL polyfill path when jsdom is not present.
// Ensure URL exists (Node provides it) and guard createObjectURL in node env.
if (typeof globalThis.URL !== 'undefined' && typeof (globalThis as any).URL.createObjectURL === 'undefined') {
  (globalThis as any).URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  (globalThis as any).URL.revokeObjectURL = vi.fn();
}
