import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AppState } from "react-native";
import * as Linking from "expo-linking";
import type { Session } from "@supabase/supabase-js";
import { supabase, hasBackendConfiguration } from "@/config/supabase";
import { queryClient, persister } from "@/lib/queryCache";
import { clearPendingQueue } from "@/services/pendingQueue";
import { toast } from "@/platform/notifications";

type AuthValue = {
  session: Session | null;
  user: Session["user"] | null;
  loading: boolean;
  recovery: boolean;
  finishRecovery: () => void;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ error: { message: string } | null }>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: { message: string } | null }>;
  signOut: () => Promise<void>;
  resetPassword: (
    email: string,
  ) => Promise<{ error: { message: string } | null }>;
};
const AuthContext = createContext<AuthValue | undefined>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [recovery, setRecovery] = useState(false);
  useEffect(() => {
    if (!hasBackendConfiguration) {
      setLoading(false);
      return;
    }
    let active = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, next) => {
      if (!active) return;
      setSession(next);
      setLoading(false);
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
      if (event === "SIGNED_OUT") {
        setRecovery(false);
        queryClient.clear();
        void persister.removeClient();
      }
    });
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (active) {
          setSession(data.session);
          setLoading(false);
          if (error) toast.error(error.message);
        }
      })
      .catch((error) => {
        if (active) {
          setLoading(false);
          toast.error(String(error));
        }
      });
    const appState = AppState.addEventListener("change", (state) => {
      if (state === "active") supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    });
    if (AppState.currentState === "active") supabase.auth.startAutoRefresh();
    let lastUrl: string | null = null;
    const handleUrl = async (url: string | null) => {
      if (!url || url === lastUrl) return;
      const parsed = Linking.parse(url);
      const params = parsed.queryParams ?? {};
      // The backend only issues PKCE callbacks for this client. No tokens are logged.
      if (typeof params.code === "string") {
        lastUrl = url;
        if (
          parsed.path === "reset-password" ||
          parsed.hostname === "reset-password"
        )
          setRecovery(true);
        const { error } = await supabase.auth.exchangeCodeForSession(
          params.code,
        );
        if (error) {
          setRecovery(false);
          toast.error(error.message);
        }
      }
    };
    void Linking.getInitialURL().then(handleUrl);
    const urls = Linking.addEventListener("url", (event) => {
      void handleUrl(event.url);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
      appState.remove();
      urls.remove();
      supabase.auth.stopAutoRefresh();
    };
  }, []);
  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        recovery,
        finishRecovery: () => setRecovery(false),
        signUp: async (email, password) => {
          if (!hasBackendConfiguration)
            return {
              error: {
                message: "Falta configurar la conexión de Attira con Supabase.",
              },
            };
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: "attira://auth" },
          });
          return { error };
        },
        signIn: async (email, password) => {
          if (!hasBackendConfiguration)
            return {
              error: {
                message: "Falta configurar la conexión de Attira con Supabase.",
              },
            };
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          return { error };
        },
        resetPassword: async (email) => {
          if (!hasBackendConfiguration)
            return {
              error: {
                message: "Falta configurar la conexión de Attira con Supabase.",
              },
            };
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: "attira://reset-password",
          });
          return { error };
        },
        signOut: async () => {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          queryClient.clear();
          await persister.removeClient();
          await clearPendingQueue();
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
