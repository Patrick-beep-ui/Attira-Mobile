import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ScreenLayout } from "@/layout/ScreenLayout";
import { navigatorOptions } from "@/layout/HeadingStyles";
import Onboarding from "@/screens/Onboarding";
import Auth from "@/screens/Auth";
import type { AuthParams } from "./types";
const Stack = createNativeStackNavigator<AuthParams>();
function OnboardingView() {
  return (
    <ScreenLayout>
      <Onboarding />
    </ScreenLayout>
  );
}
function AuthView() {
  return (
    <ScreenLayout>
      <Auth />
    </ScreenLayout>
  );
}
export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={navigatorOptions}>
      <Stack.Screen name="Onboarding" component={OnboardingView} />
      <Stack.Screen name="Auth" component={AuthView} />
    </Stack.Navigator>
  );
}
