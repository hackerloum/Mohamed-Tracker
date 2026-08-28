export interface Repository<T extends { id: string; userId: string }> {
  get(userId: string, id: string): Promise<T | null>;
  list(userId: string): Promise<T[]>;
  upsert(record: T): Promise<void>;
  remove(userId: string, id: string): Promise<void>;
}

export interface DatedRepository<T extends { id: string; userId: string }> extends Repository<T> {
  listByLocalDate(userId: string, localDate: string): Promise<T[]>;
}

export function userPath(userId: string): string {
  return `users/${userId}`;
}

export function colPath(userId: string, collection: string): string {
  return `${userPath(userId)}/${collection}`;
}

export function docPath(userId: string, collection: string, id: string): string {
  return `${colPath(userId, collection)}/${id}`;
}
