import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import UPNG from "upng-js";
import { decode } from "base64-arraybuffer";
import namer from "color-namer";
export async function detectImageColors(
  uri: string,
): Promise<{ hex: string; name: string }[]> {
  const small = await manipulateAsync(uri, [{ resize: { width: 64 } }], {
    format: SaveFormat.PNG,
    base64: true,
  });
  if (!small.base64) return [];
  const decoded = UPNG.decode(decode(small.base64));
  const rgba = new Uint8Array(UPNG.toRGBA8(decoded)[0]);
  const counts = new Map<string, number>();
  let r = 0,
    g = 0,
    b = 0,
    pixels = 0;
  for (let i = 0; i < rgba.length; i += 4) {
    if (rgba[i + 3] < 50) continue;
    r += rgba[i];
    g += rgba[i + 1];
    b += rgba[i + 2];
    pixels++;
    const hex =
      "#" +
      [rgba[i], rgba[i + 1], rgba[i + 2]]
        .map((v) =>
          Math.min(255, Math.round(v / 32) * 32)
            .toString(16)
            .padStart(2, "0"),
        )
        .join("");
    counts.set(hex, (counts.get(hex) ?? 0) + 1);
  }
  if (!pixels) return [];
  const average =
    "#" +
    [r, g, b]
      .map((v) =>
        Math.round(v / pixels)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("");
  return [
    ...new Set([
      average,
      ...[...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([hex]) => hex),
    ]),
  ].map((hex) => ({ hex, name: namer(hex).ntc?.[0]?.name ?? hex }));
}
