import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ScreenLayout } from "@/layout/ScreenLayout";
import { navigatorOptions } from "@/layout/HeadingStyles";
import type { WardrobeStackParams } from "../types";
import WardrobeScreen from "@/screens/Wardrobe";
const Stack = createNativeStackNavigator<WardrobeStackParams>();
function WardrobeView() {
  return (
    <ScreenLayout scroll={false}>
      <WardrobeScreen />
    </ScreenLayout>
  );
}
export function WardrobeStack() {
  return (
    <Stack.Navigator screenOptions={navigatorOptions}>
      <Stack.Screen name="Wardrobe" component={WardrobeView} />
    </Stack.Navigator>
  );
}
