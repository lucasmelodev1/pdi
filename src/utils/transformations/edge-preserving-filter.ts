import decode from "../decode";
import encode from "../encode";

type Region = [number, number][];

export interface EdgePreservingStrategy {
  kernelSize: number;
  regions: Region[];
}

const getPixelIndex = (x: number, y: number, width: number) => (y * width + x) * 4;

const getStats = (values: number[]) => {
  if (values.length === 0) return { mean: 0, variance: Infinity };
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  return { mean, variance };
};

export async function applyEdgePreservingFilter(
  bytes: Uint8Array,
  strategy: EdgePreservingStrategy
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

  const kernelRadius = Math.floor(strategy.kernelSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const centerIndex = getPixelIndex(x, y, width);

      if (y < kernelRadius || y >= height - kernelRadius || x < kernelRadius || x >= width - kernelRadius) {
        destPixels[centerIndex] = srcPixels[centerIndex];
        destPixels[centerIndex + 1] = srcPixels[centerIndex + 1];
        destPixels[centerIndex + 2] = srcPixels[centerIndex + 2];
        destPixels[centerIndex + 3] = srcPixels[centerIndex + 3];
        continue;
      }

      const processChannel = (channelOffset: number) => {
        let minVariance = Infinity;
        let resultMean = 0;

        for (const region of strategy.regions) {
          const values = region.map(([dy, dx]) => srcPixels[getPixelIndex(x + dx, y + dy, width) + channelOffset]);
          const { mean, variance } = getStats(values);

          if (variance < minVariance) {
            minVariance = variance;
            resultMean = mean;
          }
        }
        return resultMean;
      };

      destPixels[centerIndex] = processChannel(0); // R
      destPixels[centerIndex + 1] = processChannel(1); // G
      destPixels[centerIndex + 2] = processChannel(2); // B
      destPixels[centerIndex + 3] = srcPixels[centerIndex + 3]; // Alpha
    }
  }

  const newBytes = await encode(canvas, ctx, newImageData);
  return { newBytes, newWidth: width, newHeight: height };
}

const kawaharaRegions: Region[] = [
  // Quadrante Superior Esquerdo (3x3)
  [[-2, -2], [-2, -1], [-2, 0], [-1, -2], [-1, -1], [-1, 0], [0, -2], [0, -1], [0, 0]],
  // Quadrante Superior Direito (3x3)
  [[-2, 0], [-2, 1], [-2, 2], [-1, 0], [-1, 1], [-1, 2], [0, 0], [0, 1], [0, 2]],
  // Quadrante Inferior Esquerdo (3x3)
  [[0, -2], [0, -1], [0, 0], [1, -2], [1, -1], [1, 0], [2, -2], [2, -1], [2, 0]],
  // Quadrante Inferior Direito (3x3)
  [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]]
];

export const kawaharaStrategy: EdgePreservingStrategy = {
  kernelSize: 5,
  regions: kawaharaRegions
};

const tomitaTsujiRegions: Region[] = [
  // Região 1: Centro 3x3
  [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 0], [0, 1], [1, -1], [1, 0], [1, 1]],
  // Região 2: Superior Esquerdo 3x3 (centrado em (-1,-1) do kernel 5x5)
  [[-2, -2], [-2, -1], [-2, 0], [-1, -2], [-1, -1], [-1, 0], [0, -2], [0, -1], [0, 0]],
  // Região 3: Superior Direito 3x3 (centrado em (-1,1) do kernel 5x5)
  [[-2, 0], [-2, 1], [-2, 2], [-1, 0], [-1, 1], [-1, 2], [0, 0], [0, 1], [0, 2]],
  // Região 4: Inferior Esquerdo 3x3 (centrado em (1,-1) do kernel 5x5)
  [[0, -2], [0, -1], [0, 0], [1, -2], [1, -1], [1, 0], [2, -2], [2, -1], [2, 0]],
  // Região 5: Inferior Direito 3x3 (centrado em (1,1) do kernel 5x5)
  [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]]
];

export const tomitaTsujiStrategy: EdgePreservingStrategy = {
  kernelSize: 5,
  regions: tomitaTsujiRegions
};

const nagaoMatsuyamaRegions: Region[] = [
  [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 0], [0, 1], [1, -1], [1, 0], [1, 1]],
  [[-2, -2], [-1, -1], [0, 0], [-1, -2], [-2, -1]], // Noroeste
  [[-2, 0], [-1, 0], [0, 0], [-1, -1], [-1, 1]],   // Norte
  [[-2, 2], [-1, 1], [0, 0], [-1, 2], [-2, 1]],   // Nordeste
  [[0, -2], [0, -1], [0, 0], [-1, -1], [1, -1]],   // Oeste
  [[0, 2], [0, 1], [0, 0], [-1, 1], [1, 1]],     // Leste
  [[2, -2], [1, -1], [0, 0], [1, -2], [2, -1]],   // Sudoeste
  [[2, 0], [1, 0], [0, 0], [1, -1], [1, 1]],     // Sul
  [[2, 2], [1, 1], [0, 0], [1, 2], [2, 1]],     // Sudeste
];

export const nagaoMatsuyamaStrategy: EdgePreservingStrategy = {
  kernelSize: 5,
  regions: nagaoMatsuyamaRegions
};

const somboonkaewRegions: Region[] = [
  // Região 1: Centro 3x3
  [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 0], [0, 1], [1, -1], [1, 0], [1, 1]],
  [[-2, 0], [-1, 0], [0, 0], [-1, -1], [-1, 1]],   // Norte
  [[0, 2], [0, 1], [0, 0], [-1, 1], [1, 1]],     // Leste
  [[2, 0], [1, 0], [0, 0], [1, -1], [1, 1]],     // Sul
  [[0, -2], [0, -1], [0, 0], [-1, -1], [1, -1]],   // Oeste
];

export const somboonkaewStrategy: EdgePreservingStrategy = {
  kernelSize: 5,
  regions: somboonkaewRegions
};