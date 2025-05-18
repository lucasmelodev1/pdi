import decode from "../decode";
import encode from "../encode";

export default async function zoomIn(
  bytes: Uint8Array,
  scale: number,
  method: "replication" | "interpolation",
): Promise<{
  newBytes: Uint8Array;
  newWidth: number;
  newHeight: number;
}> {
  if (scale < 1) {
    scale = 1 / scale;
  }

  const originalCanvas = document.createElement("canvas");
  const originalCtx = originalCanvas.getContext("2d")!;
  const imageData = await decode(originalCanvas, originalCtx, bytes);

  const srcData = imageData.data;
  const srcWidth = imageData.width;
  const srcHeight = imageData.height;

  const newWidth = Math.round(srcWidth * scale);
  const newHeight = Math.round(srcHeight * scale);

  const newCanvas = document.createElement("canvas");
  newCanvas.width = newWidth;
  newCanvas.height = newHeight;
  const newCtx = newCanvas.getContext("2d")!;
  const newImageData = newCtx.createImageData(newWidth, newHeight);
  const destData = newImageData.data;

  if (method === "replication") {
    for (let y = 0; y < newHeight; y++) {
      for (let x = 0; x < newWidth; x++) {
        const srcX = Math.floor(x / scale);
        const srcY = Math.floor(y / scale);

        const srcIndex = (srcY * srcWidth + srcX) * 4;
        const destIndex = (y * newWidth + x) * 4;

        destData[destIndex + 0] = srcData[srcIndex + 0];
        destData[destIndex + 1] = srcData[srcIndex + 1];
        destData[destIndex + 2] = srcData[srcIndex + 2];
        destData[destIndex + 3] = srcData[srcIndex + 3];
      }
    }
  } else {
    for (let y = 0; y < newHeight; y++) {
      for (let x = 0; x < newWidth; x++) {
        const gx = x / scale;
        const gy = y / scale;

        const x0 = Math.floor(gx);
        const y0 = Math.floor(gy);
        const x1 = Math.min(x0 + 1, srcWidth - 1);
        const y1 = Math.min(y0 + 1, srcHeight - 1);

        const dx = gx - x0;
        const dy = gy - y0;

        const i00 = (y0 * srcWidth + x0) * 4;
        const i10 = (y0 * srcWidth + x1) * 4;
        const i01 = (y1 * srcWidth + x0) * 4;
        const i11 = (y1 * srcWidth + x1) * 4;

        const destIndex = (y * newWidth + x) * 4;

        for (let c = 0; c < 4; c++) {
          const v00 = srcData[i00 + c];
          const v10 = srcData[i10 + c];
          const v01 = srcData[i01 + c];
          const v11 = srcData[i11 + c];

          const v0 = v00 * (1 - dx) + v10 * dx;
          const v1 = v01 * (1 - dx) + v11 * dx;
          const v = v0 * (1 - dy) + v1 * dy;

          destData[destIndex + c] = Math.round(v);
        }
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
