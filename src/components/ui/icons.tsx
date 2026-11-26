import React from "react";
import { cssInterop } from "nativewind";
import * as Icons from "lucide-react-native";
import type { LucideProps } from "lucide-react-native";
const styled = (Icon: React.ComponentType<LucideProps>) => {
  cssInterop(Icon, {
    className: {
      target: "style",
      nativeStyleToProp: { color: true, width: true, height: true },
    },
  });
  return Icon as React.ComponentType<LucideProps & { className?: string }>;
};
export const MapPin = styled(Icons.MapPin);
export const Sparkles = styled(Icons.Sparkles);
export const Palette = styled(Icons.Palette);
export const Calendar = styled(Icons.Calendar);
export const Heart = styled(Icons.Heart);
export const User = styled(Icons.User);
export const X = styled(Icons.X);
export const MessageCircle = styled(Icons.MessageCircle);
export const Share2 = styled(Icons.Share2);
export const Globe = styled(Icons.Globe);
export const Lock = styled(Icons.Lock);
export const Bookmark = styled(Icons.Bookmark);
export const RefreshCw = styled(Icons.RefreshCw);
export const Loader2 = styled(Icons.Loader2);
export const Edit2 = styled(Icons.Edit2);
export const Image = styled(Icons.Image);
export const Camera = styled(Icons.Camera);
export const Upload = styled(Icons.Upload);
export const Trash2 = styled(Icons.Trash2);
export const ChevronRight = styled(Icons.ChevronRight);
export const Ruler = styled(Icons.Ruler);
export const Bell = styled(Icons.Bell);
export const Crown = styled(Icons.Crown);
export const HelpCircle = styled(Icons.HelpCircle);
export const LogOut = styled(Icons.LogOut);
export const Check = styled(Icons.Check);
export const Plus = styled(Icons.Plus);
export const CheckCircle = styled(Icons.CheckCircle);
export const Circle = styled(Icons.Circle);
export const AlertCircle = styled(Icons.AlertCircle);
export const Send = styled(Icons.Send);
export const Save = styled(Icons.Save);

export const ArrowLeft = styled(Icons.ArrowLeft);
