export interface SecureStorePort {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  deleteItemAsync(key: string): Promise<void>;
}
/** SecureStore entries remain under 2 KiB even when user metadata contains emoji. */
export function createSecureStorage(store: SecureStorePort) {
  let pending: Promise<unknown> = Promise.resolve();
  const serial = <T>(work: () => Promise<T>) => {
    const next = pending.then(work, work);
    pending = next.catch(() => {});
    return next;
  };
  const remove = async (key: string) => {
    const count = Number((await store.getItemAsync(`${key}.count`)) ?? 0);
    await store.deleteItemAsync(`${key}.count`);
    for (let i = 0; i < count; i++) await store.deleteItemAsync(`${key}.${i}`);
  };
  return {
    getItem: (key: string) =>
      serial(async () => {
        const count = Number((await store.getItemAsync(`${key}.count`)) ?? 0);
        if (!count) return null;
        const parts = await Promise.all(
          Array.from({ length: count }, (_, i) =>
            store.getItemAsync(`${key}.${i}`),
          ),
        );
        return parts.some((part) => part === null) ? null : parts.join("");
      }),
    setItem: (key: string, value: string) =>
      serial(async () => {
        await remove(key);
        const chars = Array.from(value);
        let count = 0;
        for (let i = 0; i < chars.length; i += 400) {
          await store.setItemAsync(
            `${key}.${count++}`,
            chars.slice(i, i + 400).join(""),
          );
        }
        await store.setItemAsync(`${key}.count`, String(count));
      }),
    removeItem: (key: string) => serial(() => remove(key)),
  };
}
