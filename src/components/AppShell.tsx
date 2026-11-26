import React, { useContext, type ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { TabHostContext } from "@/context/TabHostContext";
import { BottomNav } from "./BottomNav";
import { HeaderBar } from "./HeaderBar";
export function AppShell({
  children,
  hideNav,
  className,
}: {
  children: ReactNode;
  hideNav?: boolean;
  className?: string;
}) {
  const hosted = useContext(TabHostContext);
  const parts = React.Children.toArray(children);
  const first = parts[0];
  const header = React.isValidElement(first) && first.type === HeaderBar;
  return (
    <View style={{ flex: 1 }} className={className}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        stickyHeaderIndices={header ? [0] : undefined}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }}
      >
        {children}
      </ScrollView>
      {!hosted && !hideNav && <BottomNav />}
    </View>
  );
}
