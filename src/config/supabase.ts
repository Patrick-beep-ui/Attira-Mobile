import { createSecureStorage } from "@/platform/secureStorage";
import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import type { Database } from "@/integrations/supabase/types";
export const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const publicKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
export const hasBackendConfiguration = Boolean(supabaseUrl && publicKey);
export const authStorage = createSecureStorage(SecureStore);
// Public onboarding works without configuration; AuthProvider guards remote actions.
export const supabase = createClient<Database>(
  supabaseUrl || "https://unconfigured.supabase.co",
  publicKey || "unconfigured",
  {
    auth: {
      storage: authStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      flowType: "pkce",
    },
  },
);
