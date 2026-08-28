export function dedupKey(parts: {
  userId: string;
  kind: string;
  localDate: string;
  slot: string;
}): string {
  return `${parts.userId}:${parts.kind}:${parts.localDate}:${parts.slot}`;
}
