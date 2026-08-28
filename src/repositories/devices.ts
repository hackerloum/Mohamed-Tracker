import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import type { UserDevice } from "@/core/types";
import { requireDb } from "@/lib/firebase/firestore";
import { nowIso } from "@/lib/firebase/timestamps";
import { asRecord, readIso, readString } from "./parse";
import { userCollectionPath } from "./paths";
import { getSubDoc } from "./firestore";
import type { Repository } from "./types";

const COL = "devices";

function parseDevice(id: string, data: Record<string, unknown>): UserDevice {
  const platform = readString(data, "platform", "web");
  return {
    id,
    userId: readString(data, "userId"),
    token: readString(data, "token"),
    platform: platform === "ios-pwa" || platform === "android" ? platform : "web",
    userAgent: readString(data, "userAgent"),
    lastSeenAt: readIso(data, "lastSeenAt"),
    createdAt: readIso(data, "createdAt"),
    updatedAt: readIso(data, "updatedAt"),
  };
}

function devicesCol(userId: string) {
  return collection(requireDb(), userCollectionPath(userId, COL));
}

export async function listDevices(userId: string): Promise<UserDevice[]> {
  const snap = await getDocs(devicesCol(userId));
  return snap.docs.map((item) => parseDevice(item.id, asRecord(item.data())));
}

export async function writeDevice(device: UserDevice): Promise<void> {
  await setDoc(doc(devicesCol(device.userId), device.id), {
    userId: device.userId,
    token: device.token,
    platform: device.platform,
    userAgent: device.userAgent,
    lastSeenAt: device.lastSeenAt,
    createdAt: device.createdAt,
    updatedAt: nowIso(),
  });
}

export async function deleteDevice(userId: string, id: string): Promise<void> {
  await deleteDoc(doc(devicesCol(userId), id));
}

export function subscribeDevices(
  userId: string,
  onChange: (rows: UserDevice[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    query(devicesCol(userId)),
    (snap) => onChange(snap.docs.map((item) => parseDevice(item.id, asRecord(item.data())))),
    (error) => onError(error),
  );
}

export const devicesRepository: Repository<UserDevice> = {
  get: (userId, id) => getSubDoc<UserDevice>(userId, COL, id),
  list: listDevices,
  upsert: writeDevice,
  remove: deleteDevice,
};
