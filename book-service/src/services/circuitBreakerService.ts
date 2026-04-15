type CircuitState = 'closed' | 'open';

const OPEN_WINDOW_MS = 60_000;

let state: CircuitState = 'closed';
let openedAt: number | null = null;

export function isCircuitOpen(): boolean {
  return state === 'open';
}

export function isWithinOpenWindow(now: number = Date.now()): boolean {
  return state === 'open' && openedAt !== null && now - openedAt < OPEN_WINDOW_MS;
}

export function shouldAllowTrialRequest(now: number = Date.now()): boolean {
  return state === 'open' && openedAt !== null && now - openedAt >= OPEN_WINDOW_MS;
}

export function openCircuit(now: number = Date.now()): void {
  state = 'open';
  openedAt = now;
}

export function closeCircuit(): void {
  state = 'closed';
  openedAt = null;
}

export function getCircuitState(): { state: CircuitState; openedAt: number | null } {
  return { state, openedAt };
}
