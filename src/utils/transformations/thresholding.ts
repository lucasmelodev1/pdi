import decode from "../decode";
import encode from "../encode";

export async function globalThreshold(bytes: Uint8Array, threshold: number): Promise<{ newBytes: Uint8Array; newWidth: number; newHeight: number }> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const imageData = await decode(canvas, ctx, bytes);
  const { data, width, height } = imageData;
  const newImageData = ctx.createImageData(width, height);
  const dest = newImageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const value = gray >= threshold ? 255 : 0;
    dest[i] = dest[i + 1] = dest[i + 2] = value;
    dest[i + 3] = data[i + 3];
  }
  const newBytes = await encode(canvas, ctx, newImageData);
  return { newBytes, newWidth: width, newHeight: height };
}

export async function localMeanThreshold(bytes: Uint8Array, windowSize: number): Promise<{ newBytes: Uint8Array; newWidth: number; newHeight: number }> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const imageData = await decode(canvas, ctx, bytes);
  const { data, width, height } = imageData;
  const newImageData = ctx.createImageData(width, height);
  const dest = newImageData.data;
  const half = Math.floor(windowSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let count = 0;
      for (let dy = -half; dy <= half; dy++) {
        for (let dx = -half; dx <= half; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const idx = (ny * width + nx) * 4;
            const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
            sum += gray;
            count++;
          }
        }
      }
      const mean = sum / count;
      const idx = (y * width + x) * 4;
      const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      const value = gray >= mean ? 255 : 0;
      dest[idx] = dest[idx + 1] = dest[idx + 2] = value;
      dest[idx + 3] = data[idx + 3];
    }
  }
  const newBytes = await encode(canvas, ctx, newImageData);
  return { newBytes, newWidth: width, newHeight: height };
}

export async function localMaxThreshold(bytes: Uint8Array, windowSize: number): Promise<{ newBytes: Uint8Array; newWidth: number; newHeight: number }> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const imageData = await decode(canvas, ctx, bytes);
  const { data, width, height } = imageData;
  const newImageData = ctx.createImageData(width, height);
  const dest = newImageData.data;
  const half = Math.floor(windowSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let max = 0;
      for (let dy = -half; dy <= half; dy++) {
        for (let dx = -half; dx <= half; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const idx = (ny * width + nx) * 4;
            const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
            if (gray > max) max = gray;
          }
        }
      }
      const idx = (y * width + x) * 4;
      const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      const value = gray >= max ? 255 : 0;
      dest[idx] = dest[idx + 1] = dest[idx + 2] = value;
      dest[idx + 3] = data[idx + 3];
    }
  }
  const newBytes = await encode(canvas, ctx, newImageData);
  return { newBytes, newWidth: width, newHeight: height };
}

export async function localMinThreshold(bytes: Uint8Array, windowSize: number): Promise<{ newBytes: Uint8Array; newWidth: number; newHeight: number }> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const imageData = await decode(canvas, ctx, bytes);
  const { data, width, height } = imageData;
  const newImageData = ctx.createImageData(width, height);
  const dest = newImageData.data;
  const half = Math.floor(windowSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let min = 255;
      for (let dy = -half; dy <= half; dy++) {
        for (let dx = -half; dx <= half; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const idx = (ny * width + nx) * 4;
            const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
            if (gray < min) min = gray;
          }
        }
      }
      const idx = (y * width + x) * 4;
      const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      const value = gray >= min ? 255 : 0;
      dest[idx] = dest[idx + 1] = dest[idx + 2] = value;
      dest[idx + 3] = data[idx + 3];
    }
  }
  const newBytes = await encode(canvas, ctx, newImageData);
  return { newBytes, newWidth: width, newHeight: height };
}

export async function niblackThreshold(bytes: Uint8Array, windowSize: number, k: number): Promise<{ newBytes: Uint8Array; newWidth: number; newHeight: number }> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const imageData = await decode(canvas, ctx, bytes);
  const { data, width, height } = imageData;
  const newImageData = ctx.createImageData(width, height);
  const dest = newImageData.data;
  const half = Math.floor(windowSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let sumSq = 0;
      let count = 0;
      for (let dy = -half; dy <= half; dy++) {
        for (let dx = -half; dx <= half; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const idx = (ny * width + nx) * 4;

            const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
            sum += gray;
            sumSq += gray * gray;
            count++;
          }
        }
      }
      const mean = sum / count;
      const std = Math.sqrt(sumSq / count - mean * mean);
      const threshold = mean + k * std;
      const idx = (y * width + x) * 4;
      const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      const value = gray >= threshold ? 255 : 0;
      dest[idx] = dest[idx + 1] = dest[idx + 2] = value;
      dest[idx + 3] = data[idx + 3];
    }
  }
  const newBytes = await encode(canvas, ctx, newImageData);
  return { newBytes, newWidth: width, newHeight: height };
}