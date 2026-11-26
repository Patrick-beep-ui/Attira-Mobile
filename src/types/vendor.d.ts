declare module "color-namer" {
  export default function namer(color: string): {
    ntc: { name: string; hex: string; distance: number }[];
  };
}
declare module "upng-js" {
  const UPNG: {
    decode: (data: ArrayBuffer) => unknown;
    toRGBA8: (data: unknown) => ArrayBuffer[];
  };
  export default UPNG;
}
