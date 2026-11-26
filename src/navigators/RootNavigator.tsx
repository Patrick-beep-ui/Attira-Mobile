import { AuthNavigator } from "./AuthNavigator";
import { View, Text, ActivityIndicator, Pressable } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "@/context/AuthContext";
import { useProfileCheck } from "@/hooks/useProfileCheck";
import { ScreenLayout } from "@/layout/ScreenLayout";
import { navigatorOptions } from "@/layout/HeadingStyles";
import { BottomTabNavigator } from "./BottomTabNavigator";
import type { RootParams } from "./types";
import ProfileSetup from "@/screens/ProfileSetup";
import ResetPassword from "@/screens/ResetPassword";
import OutfitPage from "@/screens/OutfitPage";
import NotFound from "@/screens/NotFound";
const Stack = createNativeStackNavigator<RootParams>();
function SetupView() {
  return (
    <ScreenLayout>
      <ProfileSetup />
    </ScreenLayout>
  );
}
function RecoveryView() {
  return (
    <ScreenLayout>
      <ResetPassword />
    </ScreenLayout>
  );
}
function PublicOutfitView() {
  return (
    <ScreenLayout scroll={false}>
      <OutfitPage />
    </ScreenLayout>
  );
}
function NotFoundView() {
  return (
    <ScreenLayout>
      <NotFound />
    </ScreenLayout>
  );
}
export function RootNavigator() {
  const { loading, user, recovery } = useAuth();
  const profile = useProfileCheck();
  if (loading || profile.loading)
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#5c2336" />
      </View>
    );
  if (profile.error)
    return (
      <View style={{ flex: 1, padding: 24, justifyContent: "center", gap: 12 }}>
        <Text>{profile.error.message}</Text>
        <Pressable onPress={() => profile.retry()}>
          <Text>Reintentar / Retry</Text>
        </Pressable>
      </View>
    );
  return (
    <Stack.Navigator screenOptions={navigatorOptions}>
      {recovery ? (
        <Stack.Screen name="ResetPassword" component={RecoveryView} />
      ) : !user ? (
        <Stack.Screen name="AuthFlow" component={AuthNavigator} />
      ) : !profile.hasCompletedProfile ? (
        <Stack.Screen name="ProfileSetup" component={SetupView} />
      ) : (
        <Stack.Screen name="Main" component={BottomTabNavigator} />
      )}
      <Stack.Group navigationKey={user?.id ?? "public"}>
        {!recovery && (
          <Stack.Screen name="ResetPassword" component={RecoveryView} />
        )}
        <Stack.Screen name="PublicOutfit" component={PublicOutfitView} />
        <Stack.Screen name="NotFound" component={NotFoundView} />
      </Stack.Group>
    </Stack.Navigator>
  );
}
