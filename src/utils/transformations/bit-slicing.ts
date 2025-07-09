import decode from "../decode";
import encode from "../encode";

export default async function bitSlicing(
  bytes: Uint8Array,
): Promise<{
  bytes: Uint8Array;
  width: number;
  height: number;
}[]> {
  const originalCanvas = document.createElement("canvas");
  const originalCtx = originalCanvas.getContext("2d")!;
  const imageData = await decode(originalCanvas, originalCtx, bytes);

  const { data: pixels, width, height } = imageData;

  const grayScalePixels = new Uint8ClampedArray(width * height);
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    grayScalePixels[i / 4] = gray;
  }

  const results = [];

  for (let bit = 0; bit < 8; bit++) {
    const planeCanvas = document.createElement("canvas");
    planeCanvas.width = width;
    planeCanvas.height = height;
    const planeCtx = planeCanvas.getContext("2d")!;
    const planeImageData = planeCtx.createImageData(width, height);
    const planePixels = planeImageData.data;

    for (let i = 0; i < grayScalePixels.length; i++) {
      const grayValue = grayScalePixels[i];
      const bitValue = (grayValue >> bit) & 1;
      const color = bitValue === 1 ? 255 : 0;

      planePixels[i * 4] = color;
      planePixels[i * 4 + 1] = color;
      planePixels[i * 4 + 2] = color;
      planePixels[i * 4 + 3] = 255;
    }

    const newBytes = await encode(planeCanvas, planeCtx, planeImageData);
    results.push({ bytes: newBytes, width, height });
  }

  return results;
}