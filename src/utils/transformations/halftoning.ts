import decode from "../decode";
import encode from "../encode";

// Matrizes de threshold para pontilhado ordenado
const matrices = {
  "2x2": [
    [1, 3],
    [4, 2],
  ],
  "2x3": [
    [1, 4, 5],
    [3, 2, 6],
  ],
  "3x3": [
    [3, 7, 4],
    [6, 1, 9],
    [2, 8, 5],
  ],
};

export type OrderedDitherType = "2x2" | "2x3" | "3x3";

export async function orderedDither(
  bytes: Uint8Array,
  type: OrderedDitherType
): Promise<{ newBytes: Uint8Array; newWidth: number; newHeight: number }> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const imageData = await decode(canvas, ctx, bytes);
  const { data, width, height } = imageData;

  const matrix = matrices[type];
  const mH = matrix.length;
  const mW = matrix[0].length;
  const n = mH * mW + 1;

  const newImageData = ctx.createImageData(width, height);
  const dest = newImageData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      // Luminância
      const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      const threshold = (matrix[y % mH][x % mW] * 255) / n;
      const value = gray > threshold ? 255 : 0;
      dest[idx] = dest[idx + 1] = dest[idx + 2] = value;
      dest[idx + 3] = data[idx + 3];
    }
  }

  const newBytes = await encode(canvas, ctx, newImageData);
  return { newBytes, newWidth: width, newHeight: height };
}

// Floyd-Steinberg Dithering
const fsMatrix = [
  { x: 1, y: 0, factor: 7 / 16 },
  { x: -1, y: 1, factor: 3 / 16 },
  { x: 0, y: 1, factor: 5 / 16 },
  { x: 1, y: 1, factor: 1 / 16 },
];

export async function floydSteinbergDither(
  bytes: Uint8Array
): Promise<{ newBytes: Uint8Array; newWidth: number; newHeight: number }> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const imageData = await decode(canvas, ctx, bytes);
  const { data, width, height } = imageData;
  const newImageData = ctx.createImageData(width, height);
  const dest = newImageData.data;
  // Copia os dados para um array de trabalho
  const gray = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      gray[y * width + x] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
    }
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const old = gray[i];
      const newVal = old > 127 ? 255 : 0;
      const err = old - newVal;
      gray[i] = newVal;
      for (const { x: dx, y: dy, factor } of fsMatrix) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          gray[ny * width + nx] += err * factor;
        }
      }
    }
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const value = gray[y * width + x] > 127 ? 255 : 0;
      dest[idx] = dest[idx + 1] = dest[idx + 2] = value;
      dest[idx + 3] = data[idx + 3];
    }
  }
  const newBytes = await encode(canvas, ctx, newImageData);
  return { newBytes, newWidth: width, newHeight: height };
} 