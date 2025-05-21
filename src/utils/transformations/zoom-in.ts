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
    scale = 1 / scale; // Ensure scale is always >= 1 for zoom-in
  }

  const sourceCanvas = document.createElement("canvas");
  const sourceCtx = sourceCanvas.getContext("2d")!;
  const sourceImageData = await decode(sourceCanvas, sourceCtx, bytes);

  const sourcePixels = sourceImageData.data;
  const sourceWidth = sourceImageData.width;
  const sourceHeight = sourceImageData.height;

  const zoomedWidth = Math.round(sourceWidth * scale);
  const zoomedHeight = Math.round(sourceHeight * scale);

  const zoomedCanvas = document.createElement("canvas");
  zoomedCanvas.width = zoomedWidth;
  zoomedCanvas.height = zoomedHeight;
  const zoomedCtx = zoomedCanvas.getContext("2d")!;
  const zoomedImageData = zoomedCtx.createImageData(zoomedWidth, zoomedHeight);
  const zoomedPixels = zoomedImageData.data;

  if (method === "replication") {
    for (let y = 0; y < zoomedHeight; y++) {
      for (let x = 0; x < zoomedWidth; x++) {
        const nearestX = Math.floor(x / scale);
        const nearestY = Math.floor(y / scale);

        const sourceIndex = (nearestY * sourceWidth + nearestX) * 4;
        const destIndex = (y * zoomedWidth + x) * 4;

        zoomedPixels[destIndex + 0] = sourcePixels[sourceIndex + 0]; // R
        zoomedPixels[destIndex + 1] = sourcePixels[sourceIndex + 1]; // G
        zoomedPixels[destIndex + 2] = sourcePixels[sourceIndex + 2]; // B
        zoomedPixels[destIndex + 3] = sourcePixels[sourceIndex + 3]; // A
      }
    }
  } else {
    for (let y = 0; y < zoomedHeight; y++) {
      for (let x = 0; x < zoomedWidth; x++) {
        const srcX = x / scale;
        const srcY = y / scale;

        const x0 = Math.floor(srcX);
        const y0 = Math.floor(srcY);
        const x1 = Math.min(x0 + 1, sourceWidth - 1);
        const y1 = Math.min(y0 + 1, sourceHeight - 1);

        const dx = srcX - x0;
        const dy = srcY - y0;

        const i00 = (y0 * sourceWidth + x0) * 4;
        const i10 = (y0 * sourceWidth + x1) * 4;
        const i01 = (y1 * sourceWidth + x0) * 4;
        const i11 = (y1 * sourceWidth + x1) * 4;

        const destIndex = (y * zoomedWidth + x) * 4;

        for (let channel = 0; channel < 4; channel++) {
          const topLeft = sourcePixels[i00 + channel];
          const topRight = sourcePixels[i10 + channel];
          const bottomLeft = sourcePixels[i01 + channel];
          const bottomRight = sourcePixels[i11 + channel];

          const topInterp = topLeft * (1 - dx) + topRight * dx;
          const bottomInterp = bottomLeft * (1 - dx) + bottomRight * dx;
          const finalValue = topInterp * (1 - dy) + bottomInterp * dy;

          zoomedPixels[destIndex + channel] = Math.round(finalValue);
        }
      }
    }
  }

  // Write result to canvas
  zoomedCtx.putImageData(zoomedImageData, 0, 0);

  return {
    newBytes: await encode(zoomedCanvas, zoomedCtx, zoomedImageData),
    newWidth: zoomedWidth,
    newHeight: zoomedHeight,
  };
}
