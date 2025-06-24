import decode from "../decode";
import encode from "../encode";

export default async function falseColorOverlayHighlight(
  bytes: Uint8Array,
  highlightColor: [number, number, number] = [0, 255, 255], // magenta
  threshold: number = 0.3,
  strength: number = 0.8,
): Promise<{ bytes: Uint8Array; width: number; height: number }> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const imageData = await decode(canvas, ctx, bytes);
  const { width, height, data } = imageData;

  const newImageData = ctx.createImageData(width, height);
  const newData = newImageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    const redRatio = r === 0 ? 999 : g / b;

    const isTarget = redRatio > threshold && g > 100;

    if (isTarget) {
      // Blend with highlight color
      newData[i] = r * (1 - strength) + highlightColor[0] * strength;
      newData[i + 1] = g * (1 - strength) + highlightColor[1] * strength;
      newData[i + 2] = b * (1 - strength) + highlightColor[2] * strength;
    } else {
      // Keep original
      newData[i] = r;
      newData[i + 1] = g;
      newData[i + 2] = b;
    }

    newData[i + 3] = a;
  }

  ctx.putImageData(newImageData, 0, 0);
  return {
    bytes: await encode(canvas, ctx, newImageData),
    width,
    height,
  };
}
