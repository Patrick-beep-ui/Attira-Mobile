import { Tap } from "@/components/ui/native";
import React from "react";
import { cn } from "@/lib/utils";
interface TagChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  style?: object;
}
export function TagChip({
  label,
  active,
  onClick,
  className,
  style,
}: TagChipProps) {
  return (
    <Tap
      type="button"
      onPress={onClick}
      className={cn(
        "inline-flex items-center rounded-full px-3.5 py-1.5 text-body-sm font-medium transition-all duration-200",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "bg-muted text-muted-foreground hover:bg-muted/80",
        className,
      )}
      style={style}
    >
      {label}
    </Tap>
  );
}
