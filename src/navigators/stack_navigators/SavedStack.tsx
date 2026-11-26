import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ScreenLayout } from "@/layout/ScreenLayout";
import { navigatorOptions } from "@/layout/HeadingStyles";
import type { SavedStackParams } from "../types";
import SavedScreen from "@/screens/SavedLooks";
const Stack = createNativeStackNavigator<SavedStackParams>();
function SavedView() {
  return (
    <ScreenLayout scroll={false}>
      <SavedScreen />
    </ScreenLayout>
  );
}
export function SavedStack() {
  return (
    <Stack.Navigator screenOptions={navigatorOptions}>
      <Stack.Screen name="Saved" component={SavedView} />
    </Stack.Navigator>
  );
}
