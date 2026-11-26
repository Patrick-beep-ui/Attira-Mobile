import { useSyncExternalStore } from "react";
export type Notice = {
  id: number;
  message: string;
  kind: "success" | "error" | "info";
};
let notices: Notice[] = [];
let sequence = 0;
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((listener) => listener());
}
export function dismissNotice(id: number) {
  notices = notices.filter((notice) => notice.id !== id);
  emit();
}
function show(kind: Notice["kind"], message: string) {
  const id = ++sequence;
  notices = [...notices, { id, kind, message }].slice(-3);
  emit();
  setTimeout(() => dismissNotice(id), 4500);
  return id;
}
export const toast = {
  success: (message: string) => {
    show("success", message);
  },
  error: (message: string) => {
    show("error", message);
  },
  info: (message: string) => {
    show("info", message);
  },
};
export function useNotices() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    () => notices,
  );
}
