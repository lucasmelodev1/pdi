import decode from "../decode";
import encode from "../encode";
import type { DecomposedImage } from "./utils/decompose";

export default async function decomposeYUV(
  bytes: Uint8Array,
): Promise<DecomposedImage[]> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const imageData = await decode(canvas, ctx, bytes);
  const { data, width, height } = imageData;

  const channels = [
    new Uint8ClampedArray(data.length), // Y
    new Uint8ClampedArray(data.length), // U
    new Uint8ClampedArray(data.length), // V
  ];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    const u = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
    const v = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

    const yVal = Math.round(y);

    channels[0][i + 0] = yVal;
    channels[0][i + 1] = yVal;
    channels[0][i + 2] = yVal;
    channels[0][i + 3] = a;

    const rU = Math.round(128 + 1.402 * (0 - 128)); // 128
    const gU = Math.round(128 - 0.344136 * (u - 128) - 0.714136 * (128 - 128));
    const bU = Math.round(128 + 1.772 * (u - 128));

    channels[1][i + 0] = Math.min(255, Math.max(0, rU));
    channels[1][i + 1] = Math.min(255, Math.max(0, gU));
    channels[1][i + 2] = Math.min(255, Math.max(0, bU));
    channels[1][i + 3] = a;

    const rV = Math.round(128 + 1.402 * (v - 128));
    const gV = Math.round(128 - 0.344136 * (128 - 128) - 0.714136 * (v - 128));
    const bV = 128;

    channels[2][i + 0] = Math.min(255, Math.max(0, rV));
    channels[2][i + 1] = Math.min(255, Math.max(0, gV));
    channels[2][i + 2] = bV;
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
