// src/utils/transformations/gammaCorrection.ts
import decode from "../decode";
import encode from "../encode";

export default async function gammaCorrection(
  bytes: Uint8Array,
  gamma: number
): Promise<{
  newBytes: Uint8Array;
  newWidth: number;
  newHeight: number;
}> {
  const originalCanvas = document.createElement("canvas");
  const originalCtx = originalCanvas.getContext("2d")!;
  const imageData = await decode(originalCanvas, originalCtx, bytes);

  const srcData = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  const newCanvas = document.createElement("canvas");
  newCanvas.width = width;
  newCanvas.height = height;
  const newCtx = newCanvas.getContext("2d")!;
  const newImageData = newCtx.createImageData(width, height);
  const destData = newImageData.data;

  const gammaTable = new Uint8Array(256);
  const c = 1;
  for (let i = 0; i < 256; i++) {
    gammaTable[i] = (c * Math.pow(i / 255, gamma)) * 255;
  }

  for (let i = 0; i < srcData.length; i += 4) {
    destData[i] = gammaTable[srcData[i]];
    destData[i + 1] = gammaTable[srcData[i + 1]];
    destData[i + 2] = gammaTable[srcData[i + 2]];
    destData[i + 3] = srcData[i + 3];
  }

  newCtx.putImageData(newImageData, 0, 0);
  return {
    newBytes: await encode(newCanvas, newCtx, newImageData),
    newWidth: width,
    newHeight: height
  };
}