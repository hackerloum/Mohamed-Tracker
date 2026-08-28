export type SearchKind =
  | "activity"
  | "transaction"
  | "note"
  | "habit"
  | "prayer"
  | "study";

export interface SearchDocument {
  id: string;
  kind: SearchKind;
  title: string;
  detail: string;
  haystack: string;
  localDate: string;
  href: string;
}

export function normalizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map((token) => token.replace(/,/g, ""))
    .filter((token) => token.length > 0);
}

export function searchDocuments(query: string, documents: SearchDocument[]): SearchDocument[] {
  const tokens = normalizeQuery(query);
  if (tokens.length === 0) return [];
  return documents.filter((document) => {
    const haystack = document.haystack.toLowerCase();
    return tokens.every((token) => haystack.includes(token));
  });
}
