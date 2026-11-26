import type { GeneratedOutfit } from "@/services/ai-service";
export type DestinationState = { outfit?: GeneratedOutfit };
export type RouteParams = {
  id?: string;
  username?: string;
  state?: DestinationState;
};
export type Destination = {
  name: string;
  tab?: "HomeTab" | "WardrobeTab" | "GenerateTab" | "SavedTab" | "SettingsTab";
  params?: RouteParams;
  public?: boolean;
};
export function resolvePath(
  path: string,
  state?: DestinationState,
): Destination {
  const clean = path.split(/[?#]/)[0].replace(/\/$/, "") || "/";
  const staticRoutes: Record<string, Destination> = {
    "/": { name: "Onboarding", public: true },
    "/auth": { name: "Auth", public: true },
    "/reset-password": { name: "ResetPassword", public: true },
    "/profile-setup": { name: "ProfileSetup" },
    "/home": { tab: "HomeTab", name: "Home" },
    "/wardrobe": { tab: "WardrobeTab", name: "Wardrobe" },
    "/generate": { tab: "GenerateTab", name: "Generate" },
    "/outfit-result": {
      tab: "GenerateTab",
      name: "OutfitResult",
      params: { state },
    },
    "/saved": { tab: "SavedTab", name: "Saved" },
    "/settings": { tab: "SettingsTab", name: "Settings" },
    "/subscription": { tab: "SettingsTab", name: "Subscription" },
    "/profile": { tab: "SettingsTab", name: "Profile" },
    "/body-profile": { tab: "SettingsTab", name: "BodyProfile" },
  };
  if (staticRoutes[clean]) return staticRoutes[clean];
  const outfit = /^\/outfit\/([^/]+)$/.exec(clean);
  if (outfit)
    return {
      name: "PublicOutfit",
      public: true,
      params: { id: decodeURIComponent(outfit[1]) },
    };
  const profile = /^\/u\/([^/]+)$/.exec(clean);
  if (profile)
    return {
      tab: "HomeTab",
      name: "PublicProfile",
      params: { username: decodeURIComponent(profile[1]) },
    };
  return { name: "NotFound", public: true };
}
export const pathsByScreen: Record<string, string> = {
  Onboarding: "/",
  Auth: "/auth",
  ResetPassword: "/reset-password",
  ProfileSetup: "/profile-setup",
  Home: "/home",
  Wardrobe: "/wardrobe",
  Generate: "/generate",
  OutfitResult: "/outfit-result",
  Saved: "/saved",
  Settings: "/settings",
  Subscription: "/subscription",
  Profile: "/profile",
  BodyProfile: "/body-profile",
};
