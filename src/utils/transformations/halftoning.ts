import decode from "../decode";
import encode from "../encode";

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
  type: OrderedDitherType,
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
      const gray =
        0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      const threshold = (matrix[y % mH][x % mW] * 255) / n;
      const value = gray > threshold ? 255 : 0;
      dest[idx] = dest[idx + 1] = dest[idx + 2] = value;
      dest[idx + 3] = data[idx + 3];
    }
  }

  const newBytes = await encode(canvas, ctx, newImageData);
  return { newBytes, newWidth: width, newHeight: height };
}

const fsMatrix = [
  { x: 1, y: 0, factor: 7 / 16 },
  { x: -1, y: 1, factor: 3 / 16 },
  { x: 0, y: 1, factor: 5 / 16 },
  { x: 1, y: 1, factor: 1 / 16 },
];

export async function floydSteinbergDither(
  bytes: Uint8Array,
): Promise<{ newBytes: Uint8Array; newWidth: number; newHeight: number }> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const imageData = await decode(canvas, ctx, bytes);
  const { data, width, height } = imageData;
  const newImageData = ctx.createImageData(width, height);
  const dest = newImageData.data;

  const gray = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      gray[y * width + x] =
        0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
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

const rogersMatrix = [
  { x: 1, y: 0, factor: 7 / 16 },
  { x: -1, y: 1, factor: 2 / 16 },
  { x: 0, y: 1, factor: 4 / 16 },
  { x: 1, y: 1, factor: 1 / 16 },
];

export async function rogersDither(bytes: Uint8Array): Promise<{
  newBytes: Uint8Array;
  newWidth: number;
  newHeight: number;
}> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const imageData = await decode(canvas, ctx, bytes);
  const { data, width, height } = imageData;
  const newImageData = ctx.createImageData(width, height);
  const dest = newImageData.data;
  const gray = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      gray[y * width + x] =
        0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
    }
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const old = gray[i];
      const newVal = old > 127 ? 255 : 0;
      const err = old - newVal;
      gray[i] = newVal;
      for (const { x: dx, y: dy, factor } of rogersMatrix) {
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

const jjnMatrix = [
  { x: 1, y: 0, factor: 7 / 48 },
  { x: 2, y: 0, factor: 5 / 48 },
  { x: -2, y: 1, factor: 3 / 48 },
  { x: -1, y: 1, factor: 5 / 48 },
  { x: 0, y: 1, factor: 7 / 48 },
  { x: 1, y: 1, factor: 5 / 48 },
  { x: 2, y: 1, factor: 3 / 48 },
  { x: -2, y: 2, factor: 1 / 48 },
  { x: -1, y: 2, factor: 3 / 48 },
  { x: 0, y: 2, factor: 5 / 48 },
  { x: 1, y: 2, factor: 3 / 48 },
  { x: 2, y: 2, factor: 1 / 48 },
];

export async function jarvisJudiceNinkeDither(bytes: Uint8Array): Promise<{
  newBytes: Uint8Array;
  newWidth: number;
  newHeight: number;
}> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const imageData = await decode(canvas, ctx, bytes);
  const { data, width, height } = imageData;
  const newImageData = ctx.createImageData(width, height);
  const dest = newImageData.data;
  const gray = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      gray[y * width + x] =
        0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
    }
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const old = gray[i];
      const newVal = old > 127 ? 255 : 0;
      const err = old - newVal;
      gray[i] = newVal;
      for (const { x: dx, y: dy, factor } of jjnMatrix) {
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

const stuckiMatrix = [
  { x: 1, y: 0, factor: 8 / 42 },
  { x: 2, y: 0, factor: 4 / 42 },
  { x: -2, y: 1, factor: 2 / 42 },
  { x: -1, y: 1, factor: 4 / 42 },
  { x: 0, y: 1, factor: 8 / 42 },
  { x: 1, y: 1, factor: 4 / 42 },
  { x: 2, y: 1, factor: 2 / 42 },
  { x: -2, y: 2, factor: 1 / 42 },
  { x: -1, y: 2, factor: 2 / 42 },
  { x: 0, y: 2, factor: 4 / 42 },
  { x: 1, y: 2, factor: 2 / 42 },
  { x: 2, y: 2, factor: 1 / 42 },
];

export async function stuckiDither(bytes: Uint8Array): Promise<{
  newBytes: Uint8Array;
  newWidth: number;
  newHeight: number;
}> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const imageData = await decode(canvas, ctx, bytes);
  const { data, width, height } = imageData;
  const newImageData = ctx.createImageData(width, height);
  const dest = newImageData.data;
  const gray = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      gray[y * width + x] =
        0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
    }
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const old = gray[i];
      const newVal = old > 127 ? 255 : 0;
      const err = old - newVal;
      gray[i] = newVal;
      for (const { x: dx, y: dy, factor } of stuckiMatrix) {
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

const stevensonArceMatrix = [
  { x: 2, y: 0, factor: 32 / 200 },
  { x: -3, y: 1, factor: 12 / 200 },
  { x: -1, y: 1, factor: 26 / 200 },
  { x: 1, y: 1, factor: 30 / 200 },
  { x: 3, y: 1, factor: 16 / 200 },
  { x: -2, y: 2, factor: 12 / 200 },
  { x: 0, y: 2, factor: 26 / 200 },
  { x: 2, y: 2, factor: 12 / 200 },
  { x: -1, y: 3, factor: 12 / 200 },
  { x: 1, y: 3, factor: 12 / 200 },
];

export async function stevensonArceDither(bytes: Uint8Array): Promise<{
  newBytes: Uint8Array;
  newWidth: number;
  newHeight: number;
}> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const imageData = await decode(canvas, ctx, bytes);
  const { data, width, height } = imageData;
  const newImageData = ctx.createImageData(width, height);
  const dest = newImageData.data;
  const gray = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      gray[y * width + x] =
        0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
    }
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const old = gray[i];
      const newVal = old > 127 ? 255 : 0;
      const err = old - newVal;
      gray[i] = newVal;
      for (const { x: dx, y: dy, factor } of stevensonArceMatrix) {
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
