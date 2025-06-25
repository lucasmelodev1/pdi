import decode from "../decode";
import encode from "../encode";

// Máscara Laplaciana para detecção de pontos
const mask = [
  [0, -1, 0],
  [-1, 4, -1],
  [0, -1, 0],
];

export async function pointDetection(
  bytes: Uint8Array,
  T: number
): Promise<{ newBytes: Uint8Array; newWidth: number; newHeight: number }> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const imageData = await decode(canvas, ctx, bytes);
  const { data, width, height } = imageData;
  const newImageData = ctx.createImageData(width, height);
  const dest = newImageData.data;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sum = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const px = x + kx;
          const py = y + ky;
          const idx = (py * width + px) * 4;
          // Luminância
          const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          sum += gray * mask[ky + 1][kx + 1];
        }
      }
      const idx = (y * width + x) * 4;
      const value = Math.abs(sum) > T ? 255 : 0;
      dest[idx] = dest[idx + 1] = dest[idx + 2] = value;
      dest[idx + 3] = data[idx + 3];
    }
  }

  // Copia bordas sem filtro
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
        const idx = (y * width + x) * 4;
        dest[idx] = data[idx];
        dest[idx + 1] = data[idx + 1];
        dest[idx + 2] = data[idx + 2];
        dest[idx + 3] = data[idx + 3];
      }
    }
  }

  const newBytes = await encode(canvas, ctx, newImageData);
  return { newBytes, newWidth: width, newHeight: height };
} 