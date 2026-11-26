import type { NavigatorScreenParams } from "@react-navigation/native";
import type { DestinationState } from "./routes";
export type HomeStackParams = {
  Home: undefined;
  PublicProfile: { username: string };
};
export type WardrobeStackParams = { Wardrobe: undefined };
export type GenerateStackParams = {
  Generate: undefined;
  OutfitResult: { state?: DestinationState } | undefined;
};
export type SavedStackParams = { Saved: undefined };
export type SettingsStackParams = {
  Settings: undefined;
  Subscription: undefined;
  Profile: undefined;
  BodyProfile: undefined;
};
export type TabParams = {
  HomeTab: NavigatorScreenParams<HomeStackParams>;
  WardrobeTab: NavigatorScreenParams<WardrobeStackParams>;
  GenerateTab: NavigatorScreenParams<GenerateStackParams>;
  SavedTab: NavigatorScreenParams<SavedStackParams>;
  SettingsTab: NavigatorScreenParams<SettingsStackParams>;
};
export type AuthParams = { Onboarding: undefined; Auth: undefined };
export type RootParams = {
  AuthFlow: NavigatorScreenParams<AuthParams>;
  ResetPassword: undefined;
  ProfileSetup: undefined;
  Main: NavigatorScreenParams<TabParams>;
  PublicOutfit: { id: string };
  NotFound: undefined;
};
