import { supabase } from "@/integrations/supabase/client";

export interface SubscriptionStatus {
  plan: "free" | "premium";
  status: "active" | "past_due" | "canceled" | "trialing";
  trialAvailable: boolean;
  trialDaysRemaining: number;
}

export async function getSubscription(): Promise<SubscriptionStatus> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return {
      plan: "free",
      status: "active",
      trialAvailable: true,
      trialDaysRemaining: 7,
    };
  }

  const { data, error } = await supabase.functions.invoke<SubscriptionStatus>(
    "get-subscription",
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    },
  );

  if (error) {
    console.error("get-subscription error:", error);
    return {
      plan: "free",
      status: "active",
      trialAvailable: true,
      trialDaysRemaining: 7,
    };
  }

  if (!data) throw new Error("Subscription service returned no data");
  return data;
}
