import decode from "../decode";
import encode from "../encode";

export default async function skew(
  bytes: Uint8Array,
  shx: number,
  shy: number,
): Promise<{
  newBytes: Uint8Array;
  newWidth: number;
  newHeight: number;
}> {
  const srcCanvas = document.createElement("canvas");
  const srcCtx = srcCanvas.getContext("2d")!;
  const srcImageData = await decode(srcCanvas, srcCtx, bytes);

  const srcData = srcImageData.data;
  const srcWidth = srcImageData.width;
  const srcHeight = srcImageData.height;

  const skewedWidth = Math.round(srcWidth + Math.abs(shx) * srcHeight);
  const skewedHeight = Math.round(srcHeight + Math.abs(shy) * srcWidth);

  const destCanvas = document.createElement("canvas");
  destCanvas.width = skewedWidth;
  destCanvas.height = skewedHeight;
  const destCtx = destCanvas.getContext("2d")!;
  const destImageData = destCtx.createImageData(skewedWidth, skewedHeight);
  const destData = destImageData.data;

  for (let y = 0; y < skewedHeight; y++) {
    for (let x = 0; x < skewedWidth; x++) {
      const srcX = Math.round(x - shx * y);
      const srcY = Math.round(y - shy * x);

      if (srcX >= 0 && srcX < srcWidth && srcY >= 0 && srcY < srcHeight) {
        const srcIdx = (srcY * srcWidth + srcX) * 4;
        const destIdx = (y * skewedWidth + x) * 4;

        destData[destIdx + 0] = srcData[srcIdx + 0];
        destData[destIdx + 1] = srcData[srcIdx + 1];
        destData[destIdx + 2] = srcData[srcIdx + 2];
        destData[destIdx + 3] = srcData[srcIdx + 3];
      }
    }
  }

  destCtx.putImageData(destImageData, 0, 0);
  return {
    newBytes: await encode(destCanvas, destCtx, destImageData),
    newWidth: skewedWidth,
    newHeight: skewedHeight,
  };
}
