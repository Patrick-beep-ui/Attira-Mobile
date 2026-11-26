import { Box, TextLabel, Tap } from "@/components/ui/native";
import { useLanguage } from "@/context/LanguageContext";
export default function StepIntro({ onNext }: any) {
  const { t } = useLanguage();
  return (
    <Box className="space-y-6">
      <TextLabel className="font-display text-display-2">
        {t("step_intro.title")}
      </TextLabel>

      <TextLabel className="text-muted-foreground">
        {t("step_intro.subtitle")}
      </TextLabel>

      <Tap
        onPress={onNext}
        className="w-full bg-primary text-white py-3 rounded-xl"
      >
        {t("step_intro.start")}
      </Tap>
    </Box>
  );
}
