import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
export interface PendingAction {
  id: string;
  type: "like" | "unlike" | "publish" | "unpublish" | "save-outfit";
  payload: unknown;
  timestamp: number;
}
const key = "attira-pending-actions";
// Serialize read-modify-write operations so concurrent actions cannot overwrite each other.
let writes: Promise<unknown> = Promise.resolve();
function serialize<T>(work: () => Promise<T>): Promise<T> {
  const next = writes.then(work, work);
  writes = next.catch(() => {});
  return next;
}
async function read(): Promise<PendingAction[]> {
  const value = await AsyncStorage.getItem(key);
  return value ? JSON.parse(value) : [];
}
export function addToPendingQueue(
  type: PendingAction["type"],
  payload: unknown,
) {
  return serialize(async () => {
    const actions = await read();
    const id = Crypto.randomUUID();
    actions.push({ id, type, payload, timestamp: Date.now() });
    await AsyncStorage.setItem(key, JSON.stringify(actions));
    return id;
  });
}
export async function getPendingActions() {
  await writes;
  return read();
}
export function removeFromPendingQueue(id: string) {
  return serialize(async () => {
    await AsyncStorage.setItem(
      key,
      JSON.stringify((await read()).filter((action) => action.id !== id)),
    );
  });
}
export function clearPendingQueue() {
  return serialize(() => AsyncStorage.removeItem(key));
}
export async function getPendingActionsCount() {
  return (await getPendingActions()).length;
}
