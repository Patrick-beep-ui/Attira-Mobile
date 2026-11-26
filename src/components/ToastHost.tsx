import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNotices, dismissNotice } from "@/platform/notifications";
export function ToastHost() {
  const notices = useNotices();
  const inset = useSafeAreaInsets();
  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 16,
        right: 16,
        bottom: inset.bottom + 80,
        gap: 8,
      }}
    >
      {notices.map((notice) => (
        <Pressable
          key={notice.id}
          onPress={() => dismissNotice(notice.id)}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={{
            padding: 16,
            borderRadius: 14,
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#dfe3e7",
            flexDirection: "row",
            gap: 12,
            alignItems: "center",
          }}
        >
          <Text
            style={{ color: notice.kind === "error" ? "#dc2626" : "#5c2336" }}
          >
            {notice.kind === "success"
              ? "✓"
              : notice.kind === "error"
                ? "!"
                : "i"}
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 13,
              flex: 1,
              color: "#131416",
            }}
          >
            {notice.message}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
