import decode from "../decode";
import encode from "../encode";

export default async function reflection(
  bytes: Uint8Array,
  horizontal: boolean,
  vertical: boolean,
): Promise<{
  newBytes: Uint8Array;
  newWidth: number;
  newHeight: number;
}> {
  console.log("horizontal: ", horizontal);
  console.log("vertical: ", vertical);
  const originalCanvas = document.createElement("canvas");
  const originalCtx = originalCanvas.getContext("2d")!;
  const imageData = await decode(originalCanvas, originalCtx, bytes);

  const srcData = imageData.data;
  const srcWidth = imageData.width;
  const srcHeight = imageData.height;

  const newCanvas = document.createElement("canvas");
  newCanvas.width = srcWidth;
  newCanvas.height = srcHeight;
  const newCtx = newCanvas.getContext("2d")!;
  const newImageData = newCtx.createImageData(srcWidth, srcHeight);
  const destData = newImageData.data;

  for (let y = 0; y < srcWidth; y++) {
    for (let x = 0; x < srcHeight; x++) {
      const srcX = Math.floor(horizontal ? srcWidth - x : x);
      const srcY = Math.floor(vertical ? srcHeight - y : y);

      const srcIndex = (srcY * srcWidth + srcX) * 4;
      const destIndex = (y * srcWidth + x) * 4;

      destData[destIndex + 0] = srcData[srcIndex + 0]; // R
      destData[destIndex + 1] = srcData[srcIndex + 1]; // G
      destData[destIndex + 2] = srcData[srcIndex + 2]; // B
      destData[destIndex + 3] = srcData[srcIndex + 3]; // A
    }
  }

  newCtx.putImageData(newImageData, 0, 0);
  return {
    newBytes: await encode(newCanvas, newCtx, newImageData),
    newWidth: srcWidth,
    newHeight: srcHeight,
  };
}
