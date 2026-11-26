import { View, Text } from "react-native";
import { WifiOff, RefreshCw } from "lucide-react-native";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { usePendingCount } from "@/hooks/usePendingCount";
export function OfflineIndicator() {
  const { isOnline } = useOnlineStatus();
  const { count } = usePendingCount();
  if (isOnline && count === 0) return null;
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        bottom: 16,
        left: 16,
        right: 16,
        zIndex: 50,
        alignItems: "center",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          gap: 8,
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 30,
          backgroundColor: isOnline ? "#16a34a" : "#d97706",
          alignItems: "center",
        }}
      >
        {isOnline ? (
          <RefreshCw size={16} color="#fff" />
        ) : (
          <WifiOff size={16} color="#fff" />
        )}
        <Text
          style={{ fontFamily: "Inter_500Medium", fontSize: 14, color: "#fff" }}
        >
          {isOnline
            ? `Syncing ${count} action(s)...`
            : "Offline - changes will sync when online"}
        </Text>
      </View>
    </View>
  );
}
