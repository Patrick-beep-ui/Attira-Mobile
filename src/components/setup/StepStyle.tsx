import { Box, TextLabel, Tap } from "@/components/ui/native";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
type BodyType =
  | "ectomorph"
  | "mesomorph"
  | "endomorph"
  | "athletic"
  | "average";
type FitType = "tight" | "regular" | "relaxed" | "oversized";
type StyleType =
  | "Minimalist"
  | "Streetwear"
  | "Business Casual"
  | "Elegant"
  | "Sporty";
const bodyTypes: BodyType[] = [
  "ectomorph",
  "mesomorph",
  "endomorph",
  "athletic",
  "average",
];
const fits: FitType[] = ["tight", "regular", "relaxed", "oversized"];
const styleOptions: StyleType[] = [
  "Minimalist",
  "Streetwear",
  "Business Casual",
  "Elegant",
  "Sporty",
];
export default function StepStyle({ onNext, next, back, data }: any) {
  const { t, tValue } = useLanguage();
  const [body, setBody] = useState<BodyType | "">(data?.body_type || "");
  const [fit, setFit] = useState<FitType | "">(data?.preferred_fit || "");
  const [styles, setStyles] = useState<StyleType[]>(
    data?.style_preferences || [],
  );
  const toggleStyle = (style: StyleType) => {
    setStyles((prev) => {
      if (prev.includes(style)) return prev.filter((s) => s !== style);
      if (prev.length >= 2) return prev;
      return [...prev, style];
    });
  };
  const handle = () => {
    if (!body || !fit) return;
    onNext("style", {
      body_type: body,
      preferred_fit: fit,
      style_preferences: styles,
    });
    next();
  };
  return (
    <Box className="space-y-6">
      <TextLabel className="font-display text-display-3">
        {t("step_style.title")}
      </TextLabel>

      {/* Body Type */}
      <Box>
        <TextLabel className="text-sm font-medium mb-2">
          {t("step_style.body_type")}
        </TextLabel>
        <Box className="grid grid-cols-2 gap-3">
          {bodyTypes.map((b) => (
            <Box
              key={b}
              onPress={() => setBody(b)}
              className={`p-3 rounded-xl border cursor-pointer transition ${body === b ? "bg-primary text-white" : "bg-card"}`}
            >
              <TextLabel className="font-medium capitalize">
                {tValue("body_type_names", b)}
              </TextLabel>
              <TextLabel className="text-xs opacity-80">
                {tValue("body_types", b)}
              </TextLabel>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Fit */}
      <Box>
        <TextLabel className="text-sm font-medium mb-2">
          {t("step_style.fit_preference")}
        </TextLabel>
        <Box className="flex gap-2 flex-wrap flex-row">
          {fits.map((f) => (
            <Tap
              key={f}
              onPress={() => setFit(f)}
              className={`px-3 py-2 rounded-xl border ${fit === f ? "bg-primary text-white" : "bg-card"}`}
            >
              {tValue("fits", f)}
            </Tap>
          ))}
        </Box>
      </Box>

      {/* Style Preferences */}
      <Box>
        <Box className="flex justify-between items-center mb-2 flex-row">
          <TextLabel className="text-sm font-medium">
            {t("step_style.style_preferences")}
          </TextLabel>
          <TextLabel className="text-xs text-muted-foreground">
            {t("step_style.selected_count", { count: styles.length })}
          </TextLabel>
        </Box>
        <Box className="flex gap-2 flex-wrap flex-row">
          {styleOptions.map((s) => (
            <Tap
              key={s}
              onPress={() => toggleStyle(s)}
              className={`px-3 py-2 rounded-xl border transition ${styles.includes(s) ? "bg-primary text-white" : "bg-card"}`}
            >
              {tValue("style_preferences", s)}
            </Tap>
          ))}
        </Box>
      </Box>

      <Box className="flex gap-2 flex-row">
        <Tap onPress={back}>{t("step_style.back")}</Tap>
        <Tap
          onPress={handle}
          className="bg-primary text-white px-4 py-2 rounded"
        >
          {t("step_style.continue")}
        </Tap>
      </Box>
    </Box>
  );
}
