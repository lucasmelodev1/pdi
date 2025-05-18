import decode from "../decode";
import encode from "../encode";
import type { DecomposedImage } from "./utils/decompose";

export default async function decomposeRGB(
  bytes: Uint8Array,
): Promise<DecomposedImage[]> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const imageData = await decode(canvas, ctx, bytes);
  const { data, width, height } = imageData;

  const results: Uint8ClampedArray[] = [
    new Uint8ClampedArray(data.length), // red
    new Uint8ClampedArray(data.length), // green
    new Uint8ClampedArray(data.length), // blue
  ];

  for (let i = 0; i < data.length; i += 4) {
    results[0][i + 0] = data[i + 0];
    results[0][i + 1] = 0;
    results[0][i + 2] = 0;
    results[0][i + 3] = data[i + 3];

    results[1][i + 0] = 0;
    results[1][i + 1] = data[i + 1];
    results[1][i + 2] = 0;
    results[1][i + 3] = data[i + 3];

    results[2][i + 0] = 0;
    results[2][i + 1] = 0;
    results[2][i + 2] = data[i + 2];
    results[2][i + 3] = data[i + 3];
  }

  return Promise.all(
    results.map(async (channelData) => {
      const chCanvas = document.createElement("canvas");
      chCanvas.width = width;
      chCanvas.height = height;
      const chCtx = chCanvas.getContext("2d")!;
      const chImageData = new ImageData(channelData, width, height);
      chCtx.putImageData(chImageData, 0, 0);
      return {
        bytes: await encode(chCanvas, chCtx, chImageData),
        width,
        height,
      };
    }),
  );
}
