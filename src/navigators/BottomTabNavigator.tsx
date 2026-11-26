import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { TabParams } from "./types";
import { BottomNav } from "@/components/BottomNav";
import { TabHostContext } from "@/context/TabHostContext";
import { HomeStack } from "./stack_navigators/HomeStack";
import { WardrobeStack } from "./stack_navigators/WardrobeStack";
import { GenerateStack } from "./stack_navigators/GenerateStack";
import { SavedStack } from "./stack_navigators/SavedStack";
import { SettingsStack } from "./stack_navigators/SettingsStack";
const Tab = createBottomTabNavigator<TabParams>();
export function BottomTabNavigator() {
  return (
    <TabHostContext.Provider value={true}>
      <Tab.Navigator
        screenOptions={{ headerShown: false, tabBarHideOnKeyboard: true }}
        tabBar={(props) => <BottomNav {...props} />}
      >
        <Tab.Screen name="HomeTab" component={HomeStack} />
        <Tab.Screen name="WardrobeTab" component={WardrobeStack} />
        <Tab.Screen name="GenerateTab" component={GenerateStack} />
        <Tab.Screen name="SavedTab" component={SavedStack} />
        <Tab.Screen name="SettingsTab" component={SettingsStack} />
      </Tab.Navigator>
    </TabHostContext.Provider>
  );
}
