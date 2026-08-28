import { collection, doc } from "firebase/firestore";
import { requireDb } from "@/lib/firebase/firestore";
import { userCollectionPath } from "./paths";

export function newDocumentId(userId: string, collectionName: string): string {
  return doc(collection(requireDb(), userCollectionPath(userId, collectionName))).id;
}
