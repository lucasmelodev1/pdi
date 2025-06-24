// src/utils/transformations/gammaCorrection.ts
import decode from "../decode";
import encode from "../encode";

export default async function gammaCorrection(
  bytes: Uint8Array,
  gamma: number
): Promise<{
  newBytes: Uint8Array;
  newWidth: number;
  newHeight: number;
}> {
  // Decodifica os bytes da imagem para um canvas
  const originalCanvas = document.createElement("canvas");
  const originalCtx = originalCanvas.getContext("2d")!;
  const imageData = await decode(originalCanvas, originalCtx, bytes);

  const srcData = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  // Cria um novo canvas para o resultado
  const newCanvas = document.createElement("canvas");
  newCanvas.width = width;
  newCanvas.height = height;
  const newCtx = newCanvas.getContext("2d")!;
  const newImageData = newCtx.createImageData(width, height);
  const destData = newImageData.data;

  // Para otimizar, pré-calculamos os valores de gama em uma tabela (lookup table)
  const gammaTable = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    // Fórmula da correção de gama: Vout = 255 * (Vin / 255) ^ gamma
    gammaTable[i] = Math.pow(i / 255, gamma) * 255;
  }

  // Aplica a correção de gama para cada pixel
  for (let i = 0; i < srcData.length; i += 4) {
    destData[i] = gammaTable[srcData[i]]; // R
    destData[i + 1] = gammaTable[srcData[i + 1]]; // G
    destData[i + 2] = gammaTable[srcData[i + 2]]; // B
    destData[i + 3] = srcData[i + 3]; // A (canal alfa permanece o mesmo)
  }

  newCtx.putImageData(newImageData, 0, 0);
  return {
    newBytes: await encode(newCanvas, newCtx, newImageData),
    newWidth: width,
    newHeight: height
  };
}