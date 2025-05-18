import decode from "../decode";
import encode from "../encode";
import type { DecomposedImage } from "./utils/decompose";

export default async function decomposeCMYK(
  bytes: Uint8Array,
): Promise<DecomposedImage[]> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const imageData = await decode(canvas, ctx, bytes);
  const { data, width, height } = imageData;

  const channels = [
    new Uint8ClampedArray(data.length), // C
    new Uint8ClampedArray(data.length), // M
    new Uint8ClampedArray(data.length), // Y
    new Uint8ClampedArray(data.length), // K
  ];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    const a = data[i + 3];

    const cCMY = 1 - r;
    const mCMY = 1 - g;
    const yCMY = 1 - b;

    let c, m, y, k;

    if (Math.min(cCMY, mCMY, yCMY) === 1) {
      c = 0;
      m = 0;
      y = 0;
      k = 1;
    } else {
      k = Math.min(cCMY, mCMY, yCMY);
      c = (cCMY - k) / (1 - k);
      m = (mCMY - k) / (1 - k);
      y = (yCMY - k) / (1 - k);
    }

    // Cyan image: RGB = (1 - C, 1, 1)
    channels[0][i + 0] = Math.round((1 - c) * 255);
    channels[0][i + 1] = 255;
    channels[0][i + 2] = 255;
    channels[0][i + 3] = a;

    // Magenta image: RGB = (1, 1 - M, 1)
    channels[1][i + 0] = 255;
    channels[1][i + 1] = Math.round((1 - m) * 255);
    channels[1][i + 2] = 255;
    channels[1][i + 3] = a;

    // Yellow image: RGB = (1, 1, 1 - Y)
    channels[2][i + 0] = 255;
    channels[2][i + 1] = 255;
    channels[2][i + 2] = Math.round((1 - y) * 255);
    channels[2][i + 3] = a;

    // Key (Black) image: RGB = (1 - K, 1 - K, 1 - K) to show black component in grayscale but visible
    const kVal = Math.round((1 - k) * 255);
    channels[3][i + 0] = kVal;
    channels[3][i + 1] = kVal;
    channels[3][i + 2] = kVal;
    channels[3][i + 3] = a;
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
