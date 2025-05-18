import decode from "../decode";
import encode from "../encode";

export default async function zoomOut(
  bytes: Uint8Array,
  scale: number,
  method: "exclusion" | "average",
): Promise<{
  newBytes: Uint8Array;
  newWidth: number;
  newHeight: number;
}> {
  const originalCanvas = document.createElement("canvas");
  const originalCtx = originalCanvas.getContext("2d")!;
  const imageData = await decode(originalCanvas, originalCtx, bytes);

  const srcData = imageData.data;
  const srcWidth = imageData.width;
  const srcHeight = imageData.height;

  const newWidth = Math.floor(srcWidth / scale);
  const newHeight = Math.floor(srcHeight / scale);

  const newCanvas = document.createElement("canvas");
  newCanvas.width = newWidth;
  newCanvas.height = newHeight;
  const newCtx = newCanvas.getContext("2d")!;
  const newImageData = newCtx.createImageData(newWidth, newHeight);
  const destData = newImageData.data;

  for (let y = 0; y < newHeight; y++) {
    for (let x = 0; x < newWidth; x++) {
      const destIndex = (y * newWidth + x) * 4;

      if (method === "exclusion") {
        // Pick top-left pixel in the scale block
        const srcX = Math.floor(x * scale);
        const srcY = Math.floor(y * scale);
        const srcIndex = (srcY * srcWidth + srcX) * 4;

        destData[destIndex + 0] = srcData[srcIndex + 0]; // R
        destData[destIndex + 1] = srcData[srcIndex + 1]; // G
        destData[destIndex + 2] = srcData[srcIndex + 2]; // B
        destData[destIndex + 3] = srcData[srcIndex + 3]; // A
      } else {
        // Average all pixels in the block
        const blockSize = scale * scale;
        const sums = [0, 0, 0, 0];

        for (let dy = 0; dy < scale; dy++) {
          for (let dx = 0; dx < scale; dx++) {
            const srcX = Math.min(x * scale + dx, srcWidth - 1);
            const srcY = Math.min(y * scale + dy, srcHeight - 1);
            const srcIndex = (srcY * srcWidth + srcX) * 4;

            sums[0] += srcData[srcIndex + 0];
            sums[1] += srcData[srcIndex + 1];
            sums[2] += srcData[srcIndex + 2];
            sums[3] += srcData[srcIndex + 3];
          }
        }

        destData[destIndex + 0] = Math.round(sums[0] / blockSize);
        destData[destIndex + 1] = Math.round(sums[1] / blockSize);
        destData[destIndex + 2] = Math.round(sums[2] / blockSize);
        destData[destIndex + 3] = Math.round(sums[3] / blockSize);
      }
    }
  }

  newCtx.putImageData(newImageData, 0, 0);
  return {
    newBytes: await encode(newCanvas, newCtx, newImageData),
    newWidth,
    newHeight,
  };
}
