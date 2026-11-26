import { Box, TextLabel, Tap } from "@/components/ui/native";
import { useState } from "react";
import { useNavigate } from "@/navigators/routeAdapter";
import { AppShell } from "@/components/AppShell";
import { HeaderBar } from "@/components/HeaderBar";
import { TagChip } from "@/components/TagChip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Palette, Calendar } from "@/components/ui/icons";
import { generateOutfit } from "@/services/ai-service";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/platform/notifications";
import { useLanguage } from "@/context/LanguageContext";
const occasions = ["work", "casual", "date-night", "event"];
const formalities = ["relaxed", "balanced", "polished"];
const colorOptions = [
  { name: "Azul", hex: "#2563EB" },
  { name: "Negro", hex: "#1F2937" },
  { name: "Blanco", hex: "#F9FAFB" },
  { name: "Navy", hex: "#1E3A5F" },
  { name: "Beige", hex: "#D4B896" },
  { name: "Gris", hex: "#6B7280" },
  { name: "Verde", hex: "#059669" },
  { name: "Cafe", hex: "#92400E" },
];
export default function GenerateOutfit() {
  const navigate = useNavigate();
  const { t, tValue, tValueReverse } = useLanguage();
  const [occasion, setOccasion] = useState("");
  const [formality, setFormality] = useState("balanced");
  const [preferredColor, setPreferredColor] = useState<string | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const handleGenerate = async () => {
    if (!occasion) return;
    setLoading(true);
    try {
      const result = await generateOutfit(
        occasion.toLowerCase().replace(" ", "-"),
        formality.toLowerCase(),
        {
          preferredColor: preferredColor || undefined,
          eventTitle: showEventDetails && eventTitle ? eventTitle : undefined,
          eventDescription:
            showEventDetails && eventDescription ? eventDescription : undefined,
        },
      );
      navigate("/outfit-result", { state: { outfit: result } });
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.message || "Failed to generate outfit. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  const handleOccasionClick = (engValue: string) => {
    setOccasion(engValue);
  };
  const handleFormalityClick = (engValue: string) => {
    setFormality(engValue);
  };
  const handleColorClick = (colorName: string) => {
    setPreferredColor((prev) => (prev === colorName ? null : colorName));
  };
  return (
    <AppShell>
      <HeaderBar title={t("generate.generate")} showBack />
      <Box className="space-y-8 px-4 pt-4">
        {/* Occasion */}
        <Box className="animate-fade-slide-up space-y-3">
          <Box>
            <TextLabel className="font-display text-display-2 text-foreground">
              {t("generate.occasion")}
            </TextLabel>
            <TextLabel className="mt-1 text-body text-muted-foreground">
              {t("generate.occasion_subtitle")}
            </TextLabel>
          </Box>
          <Box className="flex flex-wrap gap-2 flex-row">
            {occasions.map((o) => (
              <TagChip
                key={o}
                label={tValue("occasions", o)}
                active={occasion === o}
                onClick={() => handleOccasionClick(o)}
              />
            ))}
          </Box>
        </Box>
        {/* Formality */}
        <Box
          className="animate-fade-slide-up space-y-3"
          style={{ animationDelay: "100ms" }}
        >
          <TextLabel className="text-body-sm font-medium text-foreground">
            {t("generate.formality")}
          </TextLabel>
          <Box className="flex flex-wrap gap-2 flex-row">
            {formalities.map((f) => (
              <TagChip
                key={f}
                label={tValue("formality", f)}
                active={formality === f}
                onClick={() => handleFormalityClick(f)}
              />
            ))}
          </Box>
        </Box>
        {/* Color Preference */}
        <Box
          className="animate-fade-slide-up space-y-3"
          style={{ animationDelay: "150ms" }}
        >
          <Box>
            <TextLabel className="text-body-sm font-medium text-foreground">
              {t("generate.color_preference")}
            </TextLabel>
            <TextLabel className="mt-1 text-body-sm text-muted-foreground">
              {t("generate.color_preference_subtitle")}
            </TextLabel>
          </Box>
          <Box className="flex flex-wrap gap-2 flex-row">
            <TagChip
              label={t("generate.no_color")}
              active={preferredColor === null}
              onClick={() => setPreferredColor(null)}
            />
            {colorOptions.map((c) => (
              <TagChip
                key={c.name}
                label={c.name}
                active={preferredColor === c.name}
                onClick={() => handleColorClick(c.name)}
                className={preferredColor === c.name ? "border-2" : ""}
                style={
                  preferredColor === c.name ? { borderColor: c.hex } : undefined
                }
              />
            ))}
          </Box>
        </Box>
        {/* Event Details Toggle */}
        <Box
          className="animate-fade-slide-up space-y-3"
          style={{ animationDelay: "200ms" }}
        >
          <Tap
            type="button"
            onPress={() => setShowEventDetails(!showEventDetails)}
            className="flex items-center gap-2 text-body-sm font-medium text-foreground flex-row"
          >
            <Calendar className="h-4 w-4" />
            {t("generate.event_context")}
          </Tap>

          {showEventDetails && (
            <Box className="space-y-3 pl-6">
              <Input
                placeholder={t("generate.event_title_placeholder")}
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="rounded-xl"
              />
              <Textarea
                placeholder={t("generate.event_description_placeholder")}
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                className="rounded-xl resize-none"
                rows={2}
              />
            </Box>
          )}
        </Box>
        {loading ? (
          <Box className="space-y-4 animate-fade-slide-up">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-4 w-1/2 rounded" />
            <TextLabel className="text-center text-body-sm text-muted-foreground">
              {t("generate.generating")}
            </TextLabel>
          </Box>
        ) : (
          <Button
            onPress={handleGenerate}
            disabled={!occasion}
            className="w-full gap-2 rounded-xl py-6 font-medium animate-fade-slide-up"
            style={{ animationDelay: "250ms" }}
          >
            <Sparkles className="h-4 w-4" />
            {t("generate.generate")} {t("outfit.outfit")}
          </Button>
        )}
      </Box>
    </AppShell>
  );
}
