import { Box, FadeBox, TextLabel } from "@/components/ui/native";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { HeaderBar } from "@/components/HeaderBar";
import { Button } from "@/components/ui/button";
import { Check, Crown } from "@/components/ui/icons";
import { useLanguage } from "@/context/LanguageContext";
import {
  getSubscription,
  SubscriptionStatus,
} from "@/services/subscription-service";
const freeFeaturesKeys = [
  "subscription_features.up_to_20_items",
  "subscription_features.3_generations_per_day",
  "subscription_features.basic_recommendations",
];
const premiumFeaturesKeys = [
  "subscription_features.unlimited_wardrobe",
  "subscription_features.unlimited_generations",
  "subscription_features.detailed_ai_notes",
  "subscription_features.body_aware",
  "subscription_features.priority_processing",
  "subscription_features.ad_free",
];
export default function Subscription() {
  const { t } = useLanguage();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(
    null,
  );
  useEffect(() => {
    getSubscription().then(setSubscription);
  }, []);
  const isPremium =
    subscription?.plan === "premium" && subscription?.status === "active";
  const isTrialing = subscription?.status === "trialing";
  return (
    <AppShell>
      <HeaderBar title={t("subscription_page.upgrade")} showBack />

      <Box className="space-y-8 px-4 pt-4 pb-8">
        <FadeBox
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Box className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 flex-row">
            <Crown className="h-7 w-7 text-primary" />
          </Box>
          <TextLabel className="font-display text-display-1 text-foreground">
            {t("subscription_page.attira_premium")}
          </TextLabel>
          <TextLabel className="mt-2 text-body text-muted-foreground">
            {t("subscription_page.unlock_full_power")}
          </TextLabel>
          {isPremium && (
            <TextLabel className="mt-2 text-body-sm text-primary font-medium">
              {t("settings.subscription")}: Active
            </TextLabel>
          )}
          {isTrialing && (
            <TextLabel className="mt-2 text-body-sm text-primary font-medium">
              {t("settings.subscription")}: Trial (
              {subscription.trialDaysRemaining} days left)
            </TextLabel>
          )}
          {!isPremium && !isTrialing && (
            <TextLabel className="mt-2 text-body-sm text-muted-foreground">
              {t("settings.subscription")}: {t("settings.free_plan")}
            </TextLabel>
          )}
        </FadeBox>

        {/* Premium Card */}
        <FadeBox
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-primary/20 bg-card p-6 shadow-sm"
        >
          <Box className="mb-1 flex items-baseline gap-1 flex-row">
            <TextLabel className="font-display text-display-1 text-foreground">
              $9.99
            </TextLabel>
            <TextLabel className="text-body text-muted-foreground">
              {t("subscription_page.per_month")}
            </TextLabel>
          </Box>
          <TextLabel className="mb-6 text-body-sm text-muted-foreground">
            {t("subscription_page.everything_you_need")}
          </TextLabel>

          <Box className="space-y-3">
            {premiumFeaturesKeys.map((f) => (
              <Box key={f} className="flex items-center gap-3 flex-row">
                <Box className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 flex-row">
                  <Check className="h-3 w-3 text-primary" />
                </Box>
                <TextLabel className="text-body text-foreground">
                  {t(f)}
                </TextLabel>
              </Box>
            ))}
          </Box>

          <Button className="mt-6 w-full rounded-xl py-6 text-body font-medium">
            {t("subscription_page.start_free_trial")}
          </Button>
          <TextLabel className="mt-2 text-center text-caption text-muted-foreground">
            {t("subscription_page.free_trial_note")}
          </TextLabel>
        </FadeBox>

        {/* Free Tier */}
        <FadeBox
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <TextLabel className="mb-4 text-body font-medium text-foreground">
            {t("subscription_page.free_plan")}
          </TextLabel>
          <Box className="space-y-2.5">
            {freeFeaturesKeys.map((f) => (
              <Box key={f} className="flex items-center gap-3 flex-row">
                <Box className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                <TextLabel className="text-body-sm text-muted-foreground">
                  {t(f)}
                </TextLabel>
              </Box>
            ))}
          </Box>
        </FadeBox>
      </Box>
    </AppShell>
  );
}
