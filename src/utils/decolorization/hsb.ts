import decode from "../decode";
import encode from "../encode";
import type { DecomposedImage } from "./utils/decompose";
import hsvToRgb from "./utils/hsv-rgb";

export default async function decomposeHSB(
  bytes: Uint8Array,
): Promise<DecomposedImage[]> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const imageData = await decode(canvas, ctx, bytes);
  const { data, width, height } = imageData;

  const channels = [
    new Uint8ClampedArray(data.length), // Hue
    new Uint8ClampedArray(data.length), // Saturation
    new Uint8ClampedArray(data.length), // Brightness
  ];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    const a = data[i + 3];

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    if (delta === 0) {
      h = 0;
    } else if (max === r) {
      h = 60 * (((g - b) / delta) % 6);
    } else if (max === g) {
      h = 60 * ((b - r) / delta + 2);
    } else {
      h = 60 * ((r - g) / delta + 4);
    }
    if (h < 0) h += 360;

    const s = max === 0 ? 0 : delta / max;

    const v = max;

    const [rh, gh, bh] = hsvToRgb(h, 1, 1);
    channels[0][i] = rh;
    channels[0][i + 1] = gh;
    channels[0][i + 2] = bh;
    channels[0][i + 3] = a;

    const satVal = Math.round(s * 255);
    channels[1][i] = satVal;
    channels[1][i + 1] = satVal;
    channels[1][i + 2] = satVal;
    channels[1][i + 3] = a;

    const brightVal = Math.round(v * 255);
    channels[2][i] = brightVal;
    channels[2][i + 1] = brightVal;
    channels[2][i + 2] = brightVal;
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
