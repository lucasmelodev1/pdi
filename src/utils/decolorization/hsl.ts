import decode from "../decode";
import encode from "../encode";
import { hslToRgb, rgbToHsl } from "./utils/hsl-rgb";

export default async function decomposeHSL(
  bytes: Uint8Array,
): Promise<{ bytes: Uint8Array; width: number; height: number }[]> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const imageData = await decode(canvas, ctx, bytes);
  const { data, width, height } = imageData;

  const channels = [
    new Uint8ClampedArray(data.length), // Hue
    new Uint8ClampedArray(data.length), // Saturation
    new Uint8ClampedArray(data.length), // Lightness
  ];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    const [h, s, l] = rgbToHsl(r, g, b);

    const [rh, gh, bh] = hslToRgb(h, 1, 0.5);
    channels[0][i] = rh;
    channels[0][i + 1] = gh;
    channels[0][i + 2] = bh;
    channels[0][i + 3] = a;

    const satVal = Math.round(s * 255);
    channels[1][i] = satVal;
    channels[1][i + 1] = satVal;
    channels[1][i + 2] = satVal;
    channels[1][i + 3] = a;

    const lightVal = Math.round(l * 255);
    channels[2][i] = lightVal;
    channels[2][i + 1] = lightVal;
    channels[2][i + 2] = lightVal;
    channels[2][i + 3] = a;
  }

  return Promise.all(
    channels.map(async (channelData) => {
      const chCanvas = document.createElement("canvas");
      chCanvas.width = width;
      chCanvas.height = height;
      const chCtx = chCanvas.getContext("2d")!;
      chCtx.putImageData(new ImageData(channelData, width, height), 0, 0);
      return {
        bytes: await encode(
          chCanvas,
          chCtx,
          chCtx.getImageData(0, 0, width, height),
        ),
        width,
        height,
      };
    }),
  );
}
