import { useNetInfo } from "@react-native-community/netinfo";
export function useOnlineStatus() {
  const state = useNetInfo();
  return {
    isOnline:
      state.isConnected !== false && state.isInternetReachable !== false,
  };
}
