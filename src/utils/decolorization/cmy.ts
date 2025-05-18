import decode from "../decode";
import encode from "../encode";
import type { DecomposedImage } from "./utils/decompose";

export default async function decomposeCMY(
  bytes: Uint8Array,
): Promise<DecomposedImage[]> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const imageData = await decode(canvas, ctx, bytes);
  const { data, width, height } = imageData;

  // 3 channels: C, M, Y
  const channels = [
    new Uint8ClampedArray(data.length),
    new Uint8ClampedArray(data.length),
    new Uint8ClampedArray(data.length),
  ];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    const a = data[i + 3];

    // Convert to CMY
    const c = 1 - r;
    const m = 1 - g;
    const y = 1 - b;

    // Cyan channel
    channels[0][i + 0] = Math.round((1 - c) * 255);
    channels[0][i + 1] = 255;
    channels[0][i + 2] = 255;
    channels[0][i + 3] = a;

    // Magenta channel
    channels[1][i + 0] = 255;
    channels[1][i + 1] = Math.round((1 - m) * 255);
    channels[1][i + 2] = 255;
    channels[1][i + 3] = a;

    // Yellow channel
    channels[2][i + 0] = 255;
    channels[2][i + 1] = 255;
    channels[2][i + 2] = Math.round((1 - y) * 255);
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
