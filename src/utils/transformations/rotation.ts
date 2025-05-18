import decode from "../decode";
import encode from "../encode";

export default async function rotation(
  bytes: Uint8Array,
  angle: number,
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

  const radians = (angle * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  const newWidth = Math.ceil(
    Math.abs(srcWidth * cos) + Math.abs(srcHeight * sin),
  );
  const newHeight = Math.ceil(
    Math.abs(srcWidth * sin) + Math.abs(srcHeight * cos),
  );

  const newCanvas = document.createElement("canvas");
  newCanvas.width = newWidth;
  newCanvas.height = newHeight;
  const newCtx = newCanvas.getContext("2d")!;
  const newImageData = newCtx.createImageData(newWidth, newHeight);
  const destData = newImageData.data;

  const cxSrc = srcWidth / 2;
  const cySrc = srcHeight / 2;
  const cxDst = newWidth / 2;
  const cyDst = newHeight / 2;

  for (let y = 0; y < newHeight; y++) {
    for (let x = 0; x < newWidth; x++) {
      const dx = x - cxDst;
      const dy = y - cyDst;

      const srcX = Math.round(cxSrc + dx * cos + dy * sin);
      const srcY = Math.round(cySrc - dx * sin + dy * cos);

      if (srcX >= 0 && srcX < srcWidth && srcY >= 0 && srcY < srcHeight) {
        const srcIndex = (srcY * srcWidth + srcX) * 4;
        const destIndex = (y * newWidth + x) * 4;

        destData[destIndex + 0] = srcData[srcIndex + 0]; // R
        destData[destIndex + 1] = srcData[srcIndex + 1]; // G
        destData[destIndex + 2] = srcData[srcIndex + 2]; // B
        destData[destIndex + 3] = srcData[srcIndex + 3]; // A
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
