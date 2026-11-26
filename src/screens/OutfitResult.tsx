import {
  Box,
  TextLabel,
  Composition,
  FadeBox,
  Picture,
} from "@/components/ui/native";
import { useLocation, useNavigate } from "@/navigators/routeAdapter";
import { AppShell } from "@/components/AppShell";
import { HeaderBar } from "@/components/HeaderBar";
import { AiBadge } from "@/components/AiBadge";
import { Button } from "@/components/ui/button";
import {
  Bookmark,
  RefreshCw,
  Share2,
  Globe,
  Lock,
} from "@/components/ui/icons";
import { toast } from "@/platform/notifications";
import type { GeneratedOutfit } from "@/services/ai-service";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  publishOutfit,
  unpublishOutfit,
  shareOutfit,
} from "@/services/outfit-service";
export default function OutfitResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, tValue, language } = useLanguage();
  const { user } = useAuth();
  const outfit = location.state?.outfit as GeneratedOutfit | undefined;
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [currentOutfitId, setCurrentOutfitId] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const compositionUrl =
    (outfit as any)?.compositionUrl ?? (outfit as any)?.composition_url ?? null;
  const weatherContext = outfit?.weather?.context ?? null;
  if (!outfit) {
    return (
      <AppShell>
        <HeaderBar title={t("outfit_result.result")} showBack />
        <Box className="flex h-64 items-center justify-center px-4 flex-row">
          <TextLabel>{t("outfit_result.no_outfit_to_display")}</TextLabel>
        </Box>
      </AppShell>
    );
  }
  const handleSave = async () => {
    if (!user) {
      toast.error(t("outfit_result.please_sign_in"));
      return;
    }
    setSaving(true);
    try {
      /*
            Save outfit
            */
      const { data: outfits, error: outfitError } = await supabase
        .from("outfits")
        .insert({
          user_id: user.id,
          occasion: outfit.occasion,
          formality: outfit.formality || "balanced",
          styling_notes: outfit.stylingNotes,
          confidence: outfit.confidence,
          composition_url: compositionUrl,
          weather_temperature: outfit.weather?.temperature ?? null,
          weather_condition: outfit.weather?.condition ?? null,
          weather_context: outfit.weather?.context ?? null,
        })
        .select("id")
        .single();
      if (outfitError) throw outfitError;
      const outfitId = outfits.id;
      setCurrentOutfitId(outfitId);
      setIsPublic(false);
      /*
            Save outfit items
            */
      const itemsInserts = outfit.items.map((it: any, idx: number) => ({
        outfit_id: outfitId,
        wardrobe_item_id: it.id,
        layer_order: idx,
      }));
      const { error: itemsError } = await supabase
        .from("outfit_items")
        .insert(itemsInserts);
      if (itemsError) throw itemsError;
      /*
            Update generation -> accepted
            */
      if (outfit.generationId) {
        const { error: genError } = await supabase
          .from("outfit_generations")
          .update({ accepted: true })
          .eq("id", outfit.generationId);
        if (genError) {
          console.error("Generation update failed:", genError);
        }
      }
      queryClient.invalidateQueries({ queryKey: ["saved-looks", user.id] });
      toast.success(t("outfit_result.look_saved"));
      navigate("/saved");
    } catch (err) {
      console.error(err);
      toast.error(t("outfit_result.failed_to_save"));
    } finally {
      setSaving(false);
    }
  };
  return (
    <AppShell>
      {/*
        {compositionUrl && (
          <div className="mb-4">
            <img src={compositionUrl} alt="Outfit composition" style={{ width: '100%', maxHeight: 360, objectFit: 'cover', borderRadius: 12 }} />
          </div>
        )}
        {compositionUrl ? (
          <div className="mb-4">
            <img src={compositionUrl} alt="Outfit composition" style={{ width: '100%', maxHeight: 360, objectFit: 'cover', borderRadius: 12 }} />
          </div>
        ) : null}
        <HeaderBar
          title={t("outfit_result.your_look")}
          showBack
          right={<AiBadge label={`${Math.round(outfit.confidence * 100)}% match`} />}
        />
      */}

      <Box className="space-y-6 px-4 pt-4 pb-8">
        {/*compositionUrl && (
          <div className="mb-4">
            <img
              src={compositionUrl}
              alt="Outfit composition"
              style={{
                width: "100%",
                maxHeight: 360,
                objectFit: "cover",
                borderRadius: 12
              }}
            />
          </div>
        )*/}

        {compositionUrl && (
          <Box
            className="mb-4 w-full max-w-sm mx-auto"
            style={{
              aspectRatio: "5 / 6",
              borderRadius: 12,
              overflow: "hidden",
              backgroundColor: "#DEDAD9",
            }}
          >
            <Composition
              className="w-full max-w-[350px] aspect-[0.833333] mx-auto rounded-lg border svg-container"
              xml={decodeURIComponent(
                compositionUrl.replace("data:image/svg+xml;utf8,", ""),
              )}
            />
          </Box>
        )}

        {weatherContext &&
          (() => {
            const parts = weatherContext.split(" and ");
            const temp = parts[0] || "";
            const condition = parts[1] || "";
            return (
              <Box className="flex items-center justify-center gap-2 text-sm text-muted-foreground flex-row">
                <TextLabel>
                  {t("outfit_result.weather")} {temp}
                  {condition && ` ${tValue("weather_conditions", condition)}`}
                </TextLabel>
              </Box>
            );
          })()}

        <Box className="space-y-3">
          {outfit.items?.map((item, i) => (
            <FadeBox
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 rounded-lg border bg-card p-4 flex-row"
            >
              {item.imageUrl ? (
                <Picture
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <Box
                  className="h-12 w-12 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              )}

              <Box className="flex-1">
                <TextLabel className="font-medium">{item.name}</TextLabel>
                <TextLabel className="text-sm uppercase text-muted-foreground">
                  {item.category ? tValue("categories", item.category) : ""}
                </TextLabel>
              </Box>
            </FadeBox>
          ))}
        </Box>

        <Box className="rounded-lg border bg-primary/5 p-4">
          <Box className="mb-2">
            <AiBadge label={t("outfit_result.styling_notes")} />
          </Box>
          <TextLabel>{outfit.stylingNotes}</TextLabel>
        </Box>

        <Box className="flex gap-3 flex-row">
          <Button onPress={handleSave} disabled={saving} className="flex-1">
            <Bookmark className="h-4 w-4" />
            {saving ? t("outfit_result.saving") : t("outfit_result.save_look")}
          </Button>

          <Button variant="outline" onPress={() => navigate("/generate")}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </Box>

        {currentOutfitId && (
          <Box className="flex gap-3 flex-row">
            <Button
              variant={isPublic ? "default" : "outline"}
              onPress={async () => {
                if (!user) return;
                setPublishing(true);
                try {
                  if (isPublic) {
                    await unpublishOutfit(user.id, currentOutfitId);
                    setIsPublic(false);
                    toast.success(t("outfit_result.outfit_is_private"));
                  } else {
                    await publishOutfit(user.id, currentOutfitId);
                    setIsPublic(true);
                    toast.success(t("outfit_result.outfit_is_public"));
                  }
                  queryClient.invalidateQueries({
                    queryKey: ["saved-looks", user.id],
                  });
                  queryClient.invalidateQueries({ queryKey: ["feed"] });
                } catch (err) {
                  toast.error(t("outfit_result.failed_to_update"));
                } finally {
                  setPublishing(false);
                }
              }}
              disabled={publishing}
              className="flex-1"
            >
              {isPublic ? (
                <>
                  <Lock className="h-4 w-4" />
                  {publishing ? "..." : t("outfit_result.make_private")}
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4" />
                  {publishing ? "..." : t("outfit_result.publish")}
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onPress={async () => {
                await shareOutfit(
                  compositionUrl ?? null,
                  currentOutfitId ?? undefined,
                  language,
                );
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </Box>
        )}
      </Box>
    </AppShell>
  );
}
