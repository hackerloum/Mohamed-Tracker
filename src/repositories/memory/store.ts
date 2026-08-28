function key(userId: string, id: string): string {
  return `${userId}:${id}`;
}

export function createMemoryStore<T extends { id: string; userId: string }>() {
  const items = new Map<string, T>();

  return {
    upsert(record: T): T {
      items.set(key(record.userId, record.id), record);
      return record;
    },
    get(userId: string, id: string): T | null {
      return items.get(key(userId, id)) ?? null;
    },
    delete(userId: string, id: string): void {
      items.delete(key(userId, id));
    },
    list(userId: string): T[] {
      return [...items.values()].filter((item) => item.userId === userId);
    },
  };
}
