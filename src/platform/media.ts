import * as ImagePicker from "expo-image-picker";
import { File as NativeFile } from "expo-file-system";
import * as Crypto from "expo-crypto";
import { decode } from "base64-arraybuffer";
export interface NativeImage {
  uri: string;
  name: string;
  type: string;
  size: number;
}
export function fromAsset(asset: ImagePicker.ImagePickerAsset): NativeImage {
  return {
    uri: asset.uri,
    name: asset.fileName ?? "image.jpg",
    type: asset.mimeType ?? "image/jpeg",
    size: asset.fileSize ?? new NativeFile(asset.uri).size,
  };
}
export async function pickImage(): Promise<NativeImage | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted)
    throw new Error("Permiso de fotos denegado / Photo permission denied");
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.9,
  });
  return result.canceled ? null : fromAsset(result.assets[0]);
}
export async function imageAsDataUrl(image: NativeImage) {
  const file = new NativeFile(image.uri);
  return `data:${image.type};base64,${await file.base64()}`;
}
export async function imageBytes(image: NativeImage) {
  return (await new NativeFile(image.uri).bytes()).buffer as ArrayBuffer;
}
export function dataUrlBytes(data: string): ArrayBuffer {
  const base64 = data.split(",")[1];
  if (!base64) throw new Error("Invalid image data");
  return decode(base64);
}
export async function bytesToPreview(bytes: ArrayBuffer): Promise<string> {
  const file = new NativeFile(
    (await import("expo-file-system")).Paths.cache,
    `${Crypto.randomUUID()}.png`,
  );
  file.create();
  file.write(new Uint8Array(bytes));
  return file.uri;
}
