import decode from "../decode";
import encode from "../encode";

// Matrizes dos filtros passa-alta
const kernels = {
  h1: [
    [0, -1, 0],
    [-1, 4, -1],
    [0, -1, 0],
  ],
  h2: [
    [-1, -1, -1],
    [-1, 8, -1],
    [-1, -1, -1],
  ],
  m1: [
    [1, -2, 1],
    [-2, 5, -2],
    [1, -2, 1],
  ],
  m2: [
    [0, -1, 0],
    [-1, 5, -1],
    [0, -1, 0],
  ],
  m3: [
    [-1, -1, -1],
    [-1, 9, -1],
    [-1, -1, -1],
  ],
};

export type HighPassType = keyof typeof kernels;

export async function highPassFilter(
  bytes: Uint8Array,
  type: HighPassType
): Promise<{ newBytes: Uint8Array; newWidth: number; newHeight: number }> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const imageData = await decode(canvas, ctx, bytes);
  const { data: srcPixels, width, height } = imageData;

  const newImageData = ctx.createImageData(width, height);
  const destPixels = newImageData.data;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const px = x + kx;
            const py = y + ky;
            const idx = (py * width + px) * 4 + c;
            sum += srcPixels[idx] * kernels[type][ky + 1][kx + 1];
          }
        }
        const idx = (y * width + x) * 4 + c;
        destPixels[idx] = Math.min(255, Math.max(0, sum));
      }
      // Copia o alpha
      const idx = (y * width + x) * 4 + 3;
      destPixels[idx] = srcPixels[idx];
    }
  }

  // Copia bordas sem filtro
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
        const idx = (y * width + x) * 4;
        destPixels[idx] = srcPixels[idx];
        destPixels[idx + 1] = srcPixels[idx + 1];
        destPixels[idx + 2] = srcPixels[idx + 2];
        destPixels[idx + 3] = srcPixels[idx + 3];
      }
    }
  }

  const newBytes = await encode(canvas, ctx, newImageData);
  return { newBytes, newWidth: width, newHeight: height };
}

export async function highPassBoostFilter(
  bytes: Uint8Array,
  boostFactor: number = 1.5
): Promise<{ newBytes: Uint8Array; newWidth: number; newHeight: number }> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const imageData = await decode(canvas, ctx, bytes);
  const { data: srcPixels, width, height } = imageData;

  const kernel = [
    [0, -1, 0],
    [-1, boostFactor + 4, -1],
    [0, -1, 0],
  ];

  const newImageData = ctx.createImageData(width, height);
  const destPixels = newImageData.data;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const px = x + kx;
            const py = y + ky;
            const idx = (py * width + px) * 4 + c;
            sum += srcPixels[idx] * kernel[ky + 1][kx + 1];
          }
        }
        const idx = (y * width + x) * 4 + c;
        destPixels[idx] = Math.min(255, Math.max(0, sum));
      }
      // Copia o alpha
      const idx = (y * width + x) * 4 + 3;
      destPixels[idx] = srcPixels[idx];
    }
  }

  // Copia bordas sem filtro
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
        const idx = (y * width + x) * 4;
        destPixels[idx] = srcPixels[idx];
        destPixels[idx + 1] = srcPixels[idx + 1];
        destPixels[idx + 2] = srcPixels[idx + 2];
        destPixels[idx + 3] = srcPixels[idx + 3];
      }
    }
  }

  const newBytes = await encode(canvas, ctx, newImageData);
  return { newBytes, newWidth: width, newHeight: height };
} 