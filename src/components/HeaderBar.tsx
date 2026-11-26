import type { ReactNode } from "react";
import { Box, TextLabel, Tap } from "./ui/native";
import { ArrowLeft } from "./ui/icons";
import { useNavigate } from "@/navigators/routeAdapter";
export function HeaderBar({
  title,
  showBack,
  right,
  className,
}: {
  title?: string;
  showBack?: boolean;
  right?: ReactNode;
  className?: string;
}) {
  const navigate = useNavigate();
  return (
    <Box
      className={`flex-row h-14 items-center justify-between bg-background px-4 ${className ?? ""}`}
    >
      <Box className="flex-row items-center gap-2">
        {showBack && (
          <Tap
            accessibilityLabel="Volver / Back"
            onPress={() => navigate(-1)}
            className="h-9 w-9 items-center justify-center rounded-full"
          >
            <ArrowLeft size={20} />
          </Tap>
        )}
        {title && (
          <TextLabel className="font-display text-display-3">{title}</TextLabel>
        )}
      </Box>
      {right && <Box>{right}</Box>}
    </Box>
  );
}
