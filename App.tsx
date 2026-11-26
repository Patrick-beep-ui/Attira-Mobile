import { PortalProvider } from "@gorhom/portal";
import { ToastHost } from "@/components/ToastHost";
import "react-native-gesture-handler";
import "./global.css";
import { useEffect } from "react";
import { View, Text, ActivityIndicator, AppState } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import type { RootParams } from "@/navigators/types";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { focusManager, onlineManager } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";
import { useFonts } from "expo-font";
import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_500Medium } from "@expo-google-fonts/inter/500Medium";
import { Inter_600SemiBold } from "@expo-google-fonts/inter/600SemiBold";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";
import { PlayfairDisplay_400Regular } from "@expo-google-fonts/playfair-display/400Regular";
import { PlayfairDisplay_500Medium } from "@expo-google-fonts/playfair-display/500Medium";
import { PlayfairDisplay_600SemiBold } from "@expo-google-fonts/playfair-display/600SemiBold";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { RootNavigator } from "@/navigators/RootNavigator";
import { queryClient, persister } from "@/lib/queryCache";
import { hasBackendConfiguration } from "@/config/supabase";
import { OfflineIndicator } from "@/components/OfflineIndicator";
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) =>
    setOnline(
      state.isConnected !== false && state.isInternetReachable !== false,
    ),
  ),
);
export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_500Medium,
    PlayfairDisplay_600SemiBold,
  });
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) =>
      focusManager.setFocused(state === "active"),
    );
    return () => sub.remove();
  }, []);
  if (fontError)
    return (
      <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
        <Text>{fontError.message}</Text>
      </View>
    );
  if (!fontsLoaded)
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator color="#5c2336" />
      </View>
    );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView
          edges={["top", "left", "right"]}
          style={{ flex: 1, backgroundColor: "#f7f1ee" }}
        >
          <StatusBar style="dark" />
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister, maxAge: 300000 }}
          >
            <AuthProvider>
              <LanguageProvider>
                <PortalProvider>
                  <OfflineIndicator />
                  <NavigationContainer<RootParams>
                    linking={{
                      prefixes: ["attira://", "https://app.attiraai.com"],
                      config: {
                        screens: {
                          AuthFlow: {
                            screens: { Onboarding: "", Auth: "auth" },
                          },
                          ResetPassword: "reset-password",
                          ProfileSetup: "profile-setup",
                          PublicOutfit: "outfit/:id",
                          Main: {
                            screens: {
                              HomeTab: {
                                screens: {
                                  Home: "home",
                                  PublicProfile: "u/:username",
                                },
                              },
                              WardrobeTab: {
                                screens: { Wardrobe: "wardrobe" },
                              },
                              GenerateTab: {
                                screens: {
                                  Generate: "generate",
                                  OutfitResult: "outfit-result",
                                },
                              },
                              SavedTab: { screens: { Saved: "saved" } },
                              SettingsTab: {
                                screens: {
                                  Settings: "settings",
                                  Subscription: "subscription",
                                  Profile: "profile",
                                  BodyProfile: "body-profile",
                                },
                              },
                            },
                          },
                          NotFound: "*",
                        },
                      },
                    }}
                  >
                    <RootNavigator />
                  </NavigationContainer>
                  <ToastHost />
                </PortalProvider>
              </LanguageProvider>
            </AuthProvider>
          </PersistQueryClientProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
