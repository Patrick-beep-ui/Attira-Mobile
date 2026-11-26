import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ScreenLayout } from "@/layout/ScreenLayout";
import { navigatorOptions } from "@/layout/HeadingStyles";
import type { HomeStackParams } from "../types";
import HomeScreen from "@/screens/HomePage";
import PublicProfileScreen from "@/screens/ProfilePage";
const Stack = createNativeStackNavigator<HomeStackParams>();
function HomeView() {
  return (
    <ScreenLayout scroll={false}>
      <HomeScreen />
    </ScreenLayout>
  );
}
function PublicProfileView() {
  return (
    <ScreenLayout>
      <PublicProfileScreen />
    </ScreenLayout>
  );
}
export function HomeStack() {
  return (
    <Stack.Navigator screenOptions={navigatorOptions}>
      <Stack.Screen name="Home" component={HomeView} />
      <Stack.Screen name="PublicProfile" component={PublicProfileView} />
    </Stack.Navigator>
  );
}
