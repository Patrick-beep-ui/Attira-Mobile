import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient } from "@tanstack/react-query";
import type { Persister } from "@tanstack/react-query-persist-client";
const CACHE_KEY = "attira-mobile-query-cache";
export const queryCacheConfig = {
  staleTime: 30_000,
  gcTime: 86_400_000,
  retry: 1,
};
export const queryClient = new QueryClient({
  defaultOptions: { queries: queryCacheConfig },
});
export const persister: Persister = {
  persistClient: async (client) => {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(client));
  },
  restoreClient: async () => {
    const value = await AsyncStorage.getItem(CACHE_KEY);
    if (!value) return undefined;
    try {
      return JSON.parse(value);
    } catch {
      await AsyncStorage.removeItem(CACHE_KEY);
      return undefined;
    }
  },
  removeClient: async () => {
    await AsyncStorage.removeItem(CACHE_KEY);
  },
};
