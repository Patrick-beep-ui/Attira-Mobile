import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ScreenLayout } from "@/layout/ScreenLayout";
import { navigatorOptions } from "@/layout/HeadingStyles";
import type { SettingsStackParams } from "../types";
import SettingsScreen from "@/screens/Settings";
import SubscriptionScreen from "@/screens/Subscription";
import ProfileScreen from "@/screens/ProfilePage";
import BodyProfileScreen from "@/screens/BodyProfile";
const Stack = createNativeStackNavigator<SettingsStackParams>();
function SettingsView() {
  return (
    <ScreenLayout scroll={false}>
      <SettingsScreen />
    </ScreenLayout>
  );
}
function SubscriptionView() {
  return (
    <ScreenLayout scroll={false}>
      <SubscriptionScreen />
    </ScreenLayout>
  );
}
function ProfileView() {
  return (
    <ScreenLayout>
      <ProfileScreen />
    </ScreenLayout>
  );
}
function BodyProfileView() {
  return (
    <ScreenLayout>
      <BodyProfileScreen />
    </ScreenLayout>
  );
}
export function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={navigatorOptions}>
      <Stack.Screen name="Settings" component={SettingsView} />
      <Stack.Screen name="Subscription" component={SubscriptionView} />
      <Stack.Screen name="Profile" component={ProfileView} />
      <Stack.Screen name="BodyProfile" component={BodyProfileView} />
    </Stack.Navigator>
  );
}
