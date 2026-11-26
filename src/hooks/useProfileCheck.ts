import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/config/supabase";
export function useProfileCheck() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: ["profile-completion", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("body_type,preferred_fit,height_cm")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return Boolean(
        data &&
          data.body_type !== null &&
          data.preferred_fit !== null &&
          data.height_cm !== null,
      );
    },
  });
  return {
    hasCompletedProfile: user ? query.data : undefined,
    loading: !!user && query.isPending,
    error: query.error,
    retry: query.refetch,
  };
}
