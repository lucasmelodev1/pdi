import decode from "../decode";
import encode from "../encode";

export default async function regionGrowing(
  bytes: Uint8Array,
  seedX: number,
  seedY: number,
  threshold: number
): Promise<{
  newBytes: Uint8Array;
  newWidth: number;
  newHeight: number;
}> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const imageData = await decode(canvas, ctx, bytes);
  const { width, height, data } = imageData;

  // Estruturas para controle
  const visited = new Array(height).fill(0).map(() => new Array(width).fill(false));
  const labels = new Array(height).fill(0).map(() => new Array(width).fill(0));
  let currentLabel = 1;

  // Funções auxiliares
  const getPixelIntensity = (x: number, y: number): number => {
    const idx = (y * width + x) * 4;
    return Math.round((data[idx] + data[idx + 1] + data[idx + 2]) / 3);
  };

  const isValidPoint = (x: number, y: number): boolean => {
    return x >= 0 && x < width && y >= 0 && y < height;
  };

  const isSimilar = (intensity1: number, intensity2: number): boolean => {
    return Math.abs(intensity1 - intensity2) <= threshold;
  };

  // 8-conectividade
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],          [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  // Crescimento de região
  const growRegion = (startX: number, startY: number): boolean => {
    const queue: {x: number, y: number}[] = [{x: startX, y: startY}];
    const seedIntensity = getPixelIntensity(startX, startY);
    let hasGrown = false;

    while (queue.length > 0) {
      const {x, y} = queue.shift()!;

      if (visited[y][x]) continue;

      const currentIntensity = getPixelIntensity(x, y);
      if (isSimilar(currentIntensity, seedIntensity)) {
        visited[y][x] = true;
        labels[y][x] = currentLabel;
        hasGrown = true;

        for (const [dx, dy] of directions) {
          const newX = x + dx;
          const newY = y + dy;
          if (isValidPoint(newX, newY) && !visited[newY][newX]) {
            queue.push({x: newX, y: newY});
          }
        }
      }
    }

    return hasGrown;
  };

  // Cresce a região inicial
  if (growRegion(seedX, seedY)) {
    currentLabel++;
  }

  // Procura por outras regiões não visitadas
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!visited[y][x]) {
        if (growRegion(x, y)) {
          currentLabel++;
        }
      }
    }
  }

  // Gera cores únicas para cada região
  const generateColor = (label: number): [number, number, number] => {
    const hue = (label * 137.508) % 360; // Distribuição usando número áureo
    const saturation = 0.7;
    const value = 0.95;
    
    // Conversão HSV para RGB
    const c = value * saturation;
    const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
    const m = value - c;

    let r, g, b;
    if (hue < 60) { r = c; g = x; b = 0; }
    else if (hue < 120) { r = x; g = c; b = 0; }
    else if (hue < 180) { r = 0; g = c; b = x; }
    else if (hue < 240) { r = 0; g = x; b = c; }
    else if (hue < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return [r, g, b];
  };

  // Aplica as cores às regiões
  const resultImageData = new ImageData(width, height);
  const colorMap: { [key: number]: [number, number, number] } = {};

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const label = labels[y][x];
      const idx = (y * width + x) * 4;

      if (label > 0) {
        if (!colorMap[label]) {
          colorMap[label] = generateColor(label);
        }
        const [r, g, b] = colorMap[label];
        resultImageData.data[idx] = r;
        resultImageData.data[idx + 1] = g;
        resultImageData.data[idx + 2] = b;
        resultImageData.data[idx + 3] = 255;
      } else {
        resultImageData.data[idx] = data[idx];
        resultImageData.data[idx + 1] = data[idx + 1];
        resultImageData.data[idx + 2] = data[idx + 2];
        resultImageData.data[idx + 3] = data[idx + 3];
      }
    }
  }

  const newBytes = await encode(canvas, ctx, resultImageData);
  return { newBytes, newWidth: width, newHeight: height };
}