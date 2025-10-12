// Vitest global setup to run before environments initialize
export default async function globalSetup() {
  if (typeof globalThis.SharedArrayBuffer === 'undefined') {
    // Not truly shared, but avoids crashes in libs that only check for existence
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    globalThis.SharedArrayBuffer = ArrayBuffer as any;
  }

  if (typeof globalThis.URL !== 'undefined' && typeof (globalThis as any).URL.createObjectURL === 'undefined') {
    (globalThis as any).URL.createObjectURL = () => 'blob:global-setup-mock-url';
    (globalThis as any).URL.revokeObjectURL = () => {};
  }
}
