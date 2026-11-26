import { useRef, useState } from "react";
import { View, Text, Pressable, Image } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import type { NativeImage } from "@/platform/media";
import { File } from "expo-file-system";
import { useLanguage } from "@/context/LanguageContext";
export type CameraMode = "flatlay" | "worn" | "detail";
const modeConfig = {
  flatlay: {
    title: "Flat Lay Photo",
    description: "Place your item flat on a clean, contrasting background",
    instruction: "Center the item within the frame",
  },
  worn: {
    title: "Worn Item Photo",
    description: "Hold the item at arm’s length or wear it",
    instruction: "Hold steady and ensure good lighting",
  },
  detail: {
    title: "Detail Photo",
    description: "Capture close-up details like patterns, textures, or tags",
    instruction: "Get close to the detail you want to capture",
  },
};
export function CameraCapture({
  mode = "flatlay",
  onCapture,
  onCancel,
}: {
  mode?: CameraMode;
  onCapture: (image: NativeImage) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [permission, request] = useCameraPermissions();
  const camera = useRef<CameraView>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [captured, setCaptured] = useState<NativeImage | null>(null);
  const { language } = useLanguage();
  const [facing, setFacing] = useState<"front" | "back">("back");
  if (!permission?.granted)
    return (
      <View style={{ padding: 16, gap: 12 }}>
        <Text>
          {language === "es"
            ? "Permití la cámara para fotografiar tus prendas."
            : "Allow camera access to photograph your clothes."}
        </Text>
        <Pressable onPress={request}>
          <Text>{language === "es" ? "Permitir cámara" : "Allow camera"}</Text>
        </Pressable>
        <Pressable onPress={onCancel}>
          <Text>{language === "es" ? "Cancelar" : "Cancel"}</Text>
        </Pressable>
      </View>
    );
  const capture = async () => {
    setBusy(true);
    setError("");
    try {
      const photo = await camera.current?.takePictureAsync({ quality: 0.9 });
      if (photo)
        setCaptured({
          uri: photo.uri,
          name: "capture.jpg",
          type: "image/jpeg",
          size: new File(photo.uri).size,
        });
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  };
  const confirm = async () => {
    if (!captured) return;
    setBusy(true);
    try {
      await onCapture(captured);
    } catch (error) {
      setError(String(error));
    } finally {
      setBusy(false);
    }
  };
  const config = modeConfig[mode];
  return (
    <View style={{ gap: 12 }}>
      <Text style={{ fontFamily: "PlayfairDisplay_600SemiBold", fontSize: 22 }}>
        {config.title}
      </Text>
      <Text
        style={{
          fontFamily: "Inter_400Regular",
          fontSize: 13,
          color: "#717984",
        }}
      >
        {config.description}
      </Text>
      <View style={{ height: 360, borderRadius: 12, overflow: "hidden" }}>
        {captured ? (
          <Image
            source={{ uri: captured.uri }}
            style={{ flex: 1 }}
            resizeMode="contain"
          />
        ) : (
          <>
            <CameraView ref={camera} style={{ flex: 1 }} facing={facing} />
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                inset: 35,
                borderWidth: 1,
                borderColor: "#fff",
                borderStyle: "dashed",
                borderRadius: mode === "flatlay" ? 8 : 60,
              }}
            />
          </>
        )}
      </View>
      <Text>{config.instruction}</Text>
      {!!error && <Text accessibilityRole="alert">{error}</Text>}
      <View style={{ flexDirection: "row", gap: 16, flexWrap: "wrap" }}>
        {captured ? (
          <>
            <Pressable disabled={busy} onPress={() => setCaptured(null)}>
              <Text>{language === "es" ? "Repetir" : "Retake"}</Text>
            </Pressable>
            <Pressable disabled={busy} onPress={confirm}>
              <Text>
                {busy ? "…" : language === "es" ? "Usar foto" : "Use photo"}
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable disabled={busy} onPress={capture}>
              <Text>
                {busy ? "…" : language === "es" ? "Capturar" : "Capture"}
              </Text>
            </Pressable>
            <Pressable
              disabled={busy}
              onPress={() => setFacing(facing === "back" ? "front" : "back")}
            >
              <Text>{language === "es" ? "Girar cámara" : "Flip camera"}</Text>
            </Pressable>
          </>
        )}
        <Pressable onPress={onCancel}>
          <Text>{language === "es" ? "Cancelar" : "Cancel"}</Text>
        </Pressable>
      </View>
    </View>
  );
}
