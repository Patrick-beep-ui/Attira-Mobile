import { Tap, Composition, Box, Picture } from "@/components/ui/native";
import { cn } from "@/lib/utils";
import { AiBadge } from "./AiBadge";
import type { GeneratedOutfit } from "@/services/ai-service";
interface OutfitCardProps {
  outfit: GeneratedOutfit;
  compact?: boolean;
  onClick?: () => void;
  className?: string;
}
function adjustSvgForCard(svgString: string): string {
  const adjusted = svgString
    .replace(/width="500"/g, 'width="100%"')
    .replace(/height="600"/g, 'height="100%"');
  if (!adjusted.includes('style="background-color')) {
    return adjusted.replace("<svg", '<svg style="background-color: #DEDAD9"');
  }
  return adjusted;
}
export function OutfitCard({
  outfit,
  compact,
  onClick,
  className,
}: OutfitCardProps) {
  const compositionUrl =
    outfit.compositionUrl ?? outfit.composition_url ?? null;
  const hasCanvas = !!compositionUrl;
  return (
    <Tap
      onPress={onClick}
      className={cn(
        "group relative w-full overflow-hidden rounded-lg border border-border bg-card text-left shadow-sm transition-all duration-200 hover:shadow-md",
        className,
      )}
    >
      {hasCanvas ? (
        <Composition
          className={cn("overflow-hidden", compact ? "h-56" : "h-72")}
          xml={adjustSvgForCard(
            decodeURIComponent(
              compositionUrl!.replace("data:image/svg+xml;utf8,", ""),
            ),
          )}
        />
      ) : (
        <Box
          className={cn(
            "grid grid-cols-2 gap-px bg-border overflow-hidden -mt-2.5",
            compact ? "h-56" : "h-72",
          )}
        >
          {outfit.items.slice(0, 4).map((item) => (
            <Box
              key={item.id}
              className="flex items-center justify-center bg-muted/50 p-2 aspect-square mx-auto w-20 rounded-full flex-row"
            >
              {item.imageUrl ? (
                <Picture
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover rounded-full"
                />
              ) : (
                <Box
                  className="h-10 w-10 rounded-full border border-border shadow-sm"
                  style={{ backgroundColor: item.color }}
                />
              )}
            </Box>
          ))}
        </Box>
      )}
    </Tap>
  );
}
