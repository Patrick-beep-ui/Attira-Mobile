import { Box, TextLabel, Tap } from "@/components/ui/native";
import { useLanguage } from "@/context/LanguageContext";
export default function StepReview({ data, onSubmit, back }: any) {
  const { t, tValue } = useLanguage();
  const name = data?.name || {};
  const physical = data?.physical || {};
  const style = data?.style || {};
  const location = data?.location || {};
  const geo = data?.geo || {};
  const rows = [
    // Physical
    {
      section: t("step_review.physical"),
      items: [
        { k: t("step_review.height"), v: `${physical.height_cm ?? "-"} cm` },
        { k: t("step_review.weight"), v: `${physical.weight_kg ?? "-"} kg` },
        {
          k: t("step_review.gender"),
          v: name.gender ? tValue("genders", name.gender) : "-",
        },
      ],
    },
    // Style
    {
      section: t("step_review.style"),
      items: [
        {
          k: t("step_review.body_type"),
          v: style.body_type ? tValue("body_type_names", style.body_type) : "-",
        },
        {
          k: t("step_review.fit"),
          v: style.preferred_fit ? tValue("fits", style.preferred_fit) : "-",
        },
      ],
    },
    // Location
    {
      section: t("step_review.location"),
      items: [
        { k: t("step_review.country"), v: location.country_code ?? "-" },
        { k: t("step_review.city"), v: location.city ?? "-" },
        geo.timezone ? { k: t("step_review.timezone"), v: geo.timezone } : null,
      ].filter(Boolean),
    },
  ];
  const handleConfirm = () => {
    onSubmit();
  };
  return (
    <Box className="space-y-6">
      <TextLabel className="font-display text-display-3">
        {t("step_review.title")}
      </TextLabel>

      <Box className="space-y-4">
        {rows.map((section) => (
          <Box key={section.section} className="border rounded-xl bg-card p-4">
            <TextLabel className="font-display text-sm font-semibold mb-2 text-muted-foreground">
              {section.section}
            </TextLabel>

            <Box className="space-y-1">
              {section.items.map((item: any) => (
                <Box key={item.k} className="flex justify-between flex-row">
                  <TextLabel className="text-sm text-muted-foreground">
                    {item.k}
                  </TextLabel>
                  <TextLabel className="text-sm font-medium">
                    {item.v}
                  </TextLabel>
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>

      <Box className="flex gap-2 pt-2 flex-row">
        <Tap onPress={back} className="px-4 py-2 rounded">
          {t("step_review.back")}
        </Tap>

        <Tap
          onPress={handleConfirm}
          className="px-4 py-2 rounded bg-primary text-white"
        >
          {t("step_review.confirm_continue")}
        </Tap>
      </Box>
    </Box>
  );
}
