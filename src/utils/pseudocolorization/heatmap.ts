import decode from "../decode";
import encode from "../encode";

export default async function heatmapPseudocolorize(
  bytes: Uint8Array,
): Promise<{ bytes: Uint8Array; width: number; height: number }> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const imageData = await decode(canvas, ctx, bytes);

  const { width, height, data } = imageData;

  const newImageData = ctx.createImageData(width, height);
  const newData = newImageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    const [r, g, b] = grayscaleToHeatmap(gray);

    newData[i] = r;
    newData[i + 1] = g;
    newData[i + 2] = b;
    newData[i + 3] = data[i + 3];
  }

  ctx.putImageData(newImageData, 0, 0);

  return {
    bytes: await encode(canvas, ctx, newImageData),
    width,
    height,
  };
}

function grayscaleToHeatmap(value: number): [number, number, number] {
  const t = Math.min(Math.max(value / 255, 0), 1);

  let r = 0,
    g = 0,
    b = 0;

  if (t <= 0.25) {
    r = 0;
    g = t * 4 * 255;
    b = 255;
  } else if (t <= 0.5) {
    r = 0;
    g = 255;
    b = (1 - (t - 0.25) * 4) * 255;
  } else if (t <= 0.75) {
    r = (t - 0.5) * 4 * 255;
    g = 255;
    b = 0;
  } else {
    r = 255;
    g = (1 - (t - 0.75) * 4) * 255;
    b = 0;
  }

  return [Math.round(r), Math.round(g), Math.round(b)];
}
