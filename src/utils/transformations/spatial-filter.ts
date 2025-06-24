import decode from "../decode";
import encode from "../encode";

type NeighborhoodValues = { r: number[]; g: number[]; b: number[] };
type NeighborhoodProcessor = (neighbors: NeighborhoodValues) => { r: number; g: number; b: number };

const getPixelIndex = (x: number, y: number, width: number) => (y * width + x) * 4;

export async function applySpatialFilter(
  bytes: Uint8Array,
  kernelSize: 3 | 5,
  processor: NeighborhoodProcessor
): Promise<{
  newBytes: Uint8Array;
  newWidth: number;
  newHeight: number;
}> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const imageData = await decode(canvas, ctx, bytes);
  const { data: srcPixels, width, height } = imageData;

  const newImageData = ctx.createImageData(width, height);
  const destPixels = newImageData.data;

  const halfKernel = Math.floor(kernelSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = getPixelIndex(x, y, width);

      if (y < halfKernel || y >= height - halfKernel || x < halfKernel || x >= width - halfKernel) {
        destPixels[index] = srcPixels[index];
        destPixels[index + 1] = srcPixels[index + 1];
        destPixels[index + 2] = srcPixels[index + 2];
        destPixels[index + 3] = srcPixels[index + 3];
        continue;
      }

      const neighbors: NeighborhoodValues = { r: [], g: [], b: [] };
      for (let ky = -halfKernel; ky <= halfKernel; ky++) {
        for (let kx = -halfKernel; kx <= halfKernel; kx++) {
          const neighborIndex = getPixelIndex(x + kx, y + ky, width);
          neighbors.r.push(srcPixels[neighborIndex]);
          neighbors.g.push(srcPixels[neighborIndex + 1]);
          neighbors.b.push(srcPixels[neighborIndex + 2]);
        }
      }

      const newPixel = processor(neighbors);

      destPixels[index] = newPixel.r;
      destPixels[index + 1] = newPixel.g;
      destPixels[index + 2] = newPixel.b;
      destPixels[index + 3] = srcPixels[index + 3];
    }
  }

  const newBytes = await encode(canvas, ctx, newImageData);
  return { newBytes, newWidth: width, newHeight: height };
}

export const meanProcessor: NeighborhoodProcessor = (neighbors) => {
  const sum = (arr: number[]) => arr.reduce((acc, val) => acc + val, 0);
  const count = neighbors.r.length;
  return {
    r: sum(neighbors.r) / count,
    g: sum(neighbors.g) / count,
    b: sum(neighbors.b) / count,
  };
};

// export const medianProcessor: NeighborhoodProcessor = (neighbors) => {
//   const findMedian = (arr: number[]) => {
//     const sorted = [...arr].sort((a, b) => a - b);
//     return sorted[Math.floor(sorted.length / 2)];
//   };
//   return {
//     r: findMedian(neighbors.r),
//     g: findMedian(neighbors.g),
//     b: findMedian(neighbors.b),
//   };
// };

export const medianProcessor: NeighborhoodProcessor = (neighbors) => {
  const findMedianWithHistogram = (arr: number[]) => {
    const histogram = new Uint16Array(256); // Uint16Array to be safe with larger kernels

    for (let i = 0; i < arr.length; i++) {
      histogram[arr[i]]++;
    }

    const medianPosition = Math.floor(arr.length / 2);
    let count = 0;
    for (let i = 0; i < 256; i++) {
      count += histogram[i];
      if (count > medianPosition) {
        return i;
      }
    }

    return arr[medianPosition];
  };

  return {
    r: findMedianWithHistogram(neighbors.r),
    g: findMedianWithHistogram(neighbors.g),
    b: findMedianWithHistogram(neighbors.b),
  };
};

export const maxProcessor: NeighborhoodProcessor = (neighbors) => ({
  r: Math.max(...neighbors.r),
  g: Math.max(...neighbors.g),
  b: Math.max(...neighbors.b),
});

export const minProcessor: NeighborhoodProcessor = (neighbors) => ({
  r: Math.min(...neighbors.r),
  g: Math.min(...neighbors.g),
  b: Math.min(...neighbors.b),
});

export const modeProcessor: NeighborhoodProcessor = (neighbors) => {
  const findMode = (arr: number[]) => {
    const frequencyMap: { [key: number]: number } = {};
    let maxFreq = 0;
    let mode = arr[0];
    for (const num of arr) {
      frequencyMap[num] = (frequencyMap[num] || 0) + 1;
      if (frequencyMap[num] > maxFreq) {
        maxFreq = frequencyMap[num];
        mode = num;
      }
    }
    return mode;
  };
  return {
    r: findMode(neighbors.r),
    g: findMode(neighbors.g),
    b: findMode(neighbors.b),
  };
};