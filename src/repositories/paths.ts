export function userDocPath(userId: string): string {
  return `users/${userId}`;
}

export function userCollectionPath(userId: string, name: string): string {
  return `users/${userId}/${name}`;
}

export function habitEntryId(habitId: string, localDate: string): string {
  return `${habitId}_${localDate}`;
}

export function prayerEntryId(prayerKey: string, localDate: string): string {
  return `${prayerKey}_${localDate}`;
}
