import '@testing-library/jest-dom/vitest'

// jsdom has no ResizeObserver implementation; React Flow (used by the Dependency Map)
// requires one to measure its pane, so tests get a minimal no-op stub.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver
}
