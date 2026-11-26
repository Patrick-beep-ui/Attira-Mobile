import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ScreenLayout } from "@/layout/ScreenLayout";
import { navigatorOptions } from "@/layout/HeadingStyles";
import type { GenerateStackParams } from "../types";
import GenerateScreen from "@/screens/GenerateOutfit";
import OutfitResultScreen from "@/screens/OutfitResult";
const Stack = createNativeStackNavigator<GenerateStackParams>();
function GenerateView() {
  return (
    <ScreenLayout scroll={false}>
      <GenerateScreen />
    </ScreenLayout>
  );
}
function OutfitResultView() {
  return (
    <ScreenLayout scroll={false}>
      <OutfitResultScreen />
    </ScreenLayout>
  );
}
export function GenerateStack() {
  return (
    <Stack.Navigator screenOptions={navigatorOptions}>
      <Stack.Screen name="Generate" component={GenerateView} />
      <Stack.Screen name="OutfitResult" component={OutfitResultView} />
    </Stack.Navigator>
  );
}
