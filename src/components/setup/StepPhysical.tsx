import { Box, TextLabel, Input } from "@/components/ui/native";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
export default function StepPhysical({ data, onNext, next }: any) {
  const { t } = useLanguage();
  const [height, setHeight] = useState(data.height_cm || "");
  const [weight, setWeight] = useState(data.weight_kg || "");
  const handle = () => {
    const h = Number(height);
    const w = Number(weight);
    if (Number.isNaN(h) || h < 120 || h > 220) return;
    if (Number.isNaN(w) || w < 35 || w > 200) return;
    onNext("physical", { height_cm: h, weight_kg: w });
    next();
  };
  return (
    <Box className="space-y-6">
      <TextLabel className="font-display text-display-3">
        {t("step_physical.title")}
      </TextLabel>
      <TextLabel className="text-muted-foreground text-sm">
        {t("step_physical.subtitle")}
      </TextLabel>

      <Input
        className="rounded-xl border border-border bg-card w-full py-3 px-3"
        value={height}
        onChange={(e) => setHeight(e.target.value)}
        placeholder={t("step_physical.height_placeholder")}
        type="number"
      />

      <Input
        className="rounded-xl border border-border bg-card w-full py-3 px-3"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        placeholder={t("step_physical.weight_placeholder")}
        type="number"
      />

      <Button onPress={handle} className="w-full">
        {t("step_physical.continue")}
      </Button>
    </Box>
  );
}
