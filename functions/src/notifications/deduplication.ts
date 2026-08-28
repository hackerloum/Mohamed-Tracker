export { dedupKey } from "../../../src/core/engines/notificationDedup";

const sent = new Set<string>();

export function hasSent(key: string): boolean {
  return sent.has(key);
}

export function markSent(key: string): void {
  sent.add(key);
}
