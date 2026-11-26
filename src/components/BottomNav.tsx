import { View, Pressable, Text } from "react-native";
import { Home, ShirtIcon, Sparkles, Bookmark, User } from "lucide-react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { useLanguage } from "@/context/LanguageContext";
import { useNavigate } from "@/navigators/routeAdapter";
const tabs = [
  { path: "/home", name: "HomeTab", label: "nav.home", Icon: Home },
  {
    path: "/wardrobe",
    name: "WardrobeTab",
    label: "nav.wardrobe",
    Icon: ShirtIcon,
  },
  {
    path: "/generate",
    name: "GenerateTab",
    label: "nav.generate",
    Icon: Sparkles,
  },
  { path: "/saved", name: "SavedTab", label: "nav.saved", Icon: Bookmark },
  { path: "/settings", name: "SettingsTab", label: "nav.profile", Icon: User },
];
export function BottomNav(props: Partial<BottomTabBarProps> = {}) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const inset = useSafeAreaInsets();
  const state = props?.state;
  const current = state?.routes[state.index];
  const screen = current ? getFocusedRouteNameFromRoute(current) : undefined;
  if (screen && ["BodyProfile", "Profile", "PublicProfile"].includes(screen))
    return null;
  return (
    <View
      style={{
        borderTopWidth: 1,
        borderColor: "#dfe3e7",
        backgroundColor: "#f7f1ee",
        paddingBottom: inset.bottom,
        flexDirection: "row",
        height: 64 + inset.bottom,
        justifyContent: "space-around",
        alignItems: "center",
      }}
    >
      {tabs.map(({ path, name, label, Icon }) => {
        const active = current?.name === name;
        const route = state?.routes.find((route) => route.name === name);
        return (
          <Pressable
            key={name}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={t(label)}
            onPress={() => {
              if (props?.navigation && route) {
                const event = props.navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!event.defaultPrevented) props.navigation.navigate(name);
              } else navigate(path);
            }}
            onLongPress={() => {
              if (props?.navigation && route)
                props.navigation.emit({
                  type: "tabLongPress",
                  target: route.key,
                });
            }}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              alignItems: "center",
              gap: 2,
            }}
          >
            <Icon
              size={20}
              color={active ? "#5c2336" : "#303a45"}
              strokeWidth={active ? 2.5 : 2}
            />
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 11,
                letterSpacing: 0.44,
                color: active ? "#5c2336" : "#303a45",
              }}
            >
              {t(label)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
