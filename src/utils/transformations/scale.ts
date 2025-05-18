import decode from "../decode";
import encode from "../encode";

export default async function scale(
  bytes: Uint8Array,
  scaleX: number,
  scaleY: number,
): Promise<{
  newBytes: Uint8Array;
  newWidth: number;
  newHeight: number;
}> {
  // Decode image from bytes
  const originalCanvas = document.createElement("canvas");
  const originalCtx = originalCanvas.getContext("2d")!;
  const imageData = await decode(originalCanvas, originalCtx, bytes);

  const srcData = imageData.data;
  const srcWidth = imageData.width;
  const srcHeight = imageData.height;

  const newWidth = Math.round(srcWidth * scaleX);
  const newHeight = Math.round(srcHeight * scaleY);

  const newCanvas = document.createElement("canvas");
  newCanvas.width = newWidth;
  newCanvas.height = newHeight;
  const newCtx = newCanvas.getContext("2d")!;
  const newImageData = newCtx.createImageData(newWidth, newHeight);
  const destData = newImageData.data;

  // Nearest-neighbor scaling
  for (let y = 0; y < newHeight; y++) {
    for (let x = 0; x < newWidth; x++) {
      const srcX = Math.floor(x / scaleX);
      const srcY = Math.floor(y / scaleY);

      const srcIndex = (srcY * srcWidth + srcX) * 4;
      const destIndex = (y * newWidth + x) * 4;

      destData[destIndex + 0] = srcData[srcIndex + 0]; // R
      destData[destIndex + 1] = srcData[srcIndex + 1]; // G
      destData[destIndex + 2] = srcData[srcIndex + 2]; // B
      destData[destIndex + 3] = srcData[srcIndex + 3]; // A
    }
  }

  newCtx.putImageData(newImageData, 0, 0);
  return {
    newBytes: await encode(newCanvas, newCtx, newImageData),
    newWidth,
    newHeight,
  };
}
