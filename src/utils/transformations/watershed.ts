import decode from "../decode";
import encode from "../encode";

export default async function watershed(
  bytes: Uint8Array, 
  threshold: number = 30
): Promise<{
  newBytes: Uint8Array;
  newWidth: number;
  newHeight: number;
}> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const imageData = await decode(canvas, ctx, bytes);
  const { width, height, data } = imageData;

  canvas.width = width;
  canvas.height = height;
  
  const resultImageData = ctx.createImageData(width, height);
  const resultData = resultImageData.data;
  resultData.set(data);
  
  // Converter para escala de cinza e calcular gradiente
  const grayscale = new Uint8Array(width * height);
  const gradient = new Uint8Array(width * height);
  
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    grayscale[i] = Math.round((data[idx] + data[idx + 1] + data[idx + 2]) / 3);
  }

  // Calcular gradiente Sobel
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      
      const gx = 
        grayscale[idx - width - 1] + 2 * grayscale[idx - 1] + grayscale[idx + width - 1] -
        grayscale[idx - width + 1] - 2 * grayscale[idx + 1] - grayscale[idx + width + 1];
      
      const gy = 
        grayscale[idx - width - 1] + 2 * grayscale[idx - width] + grayscale[idx - width + 1] -
        grayscale[idx + width - 1] - 2 * grayscale[idx + width] - grayscale[idx + width + 1];
      
      gradient[idx] = Math.min(255, Math.sqrt(gx * gx + gy * gy));
    }
  }

  // Inicializar rótulos
  const labels = new Int32Array(width * height).fill(0);
  let currentLabel = 1;

  // Encontrar mínimos locais como marcadores iniciais
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (gradient[idx] < threshold) {
        let isMinimum = true;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            if (gradient[idx] > gradient[(y + dy) * width + (x + dx)]) {
              isMinimum = false;
              break;
            }
          }
          if (!isMinimum) break;
        }
        if (isMinimum) {
          labels[idx] = currentLabel++;
        }
      }
    }
  }

  // Simular processo de imersão
  let changed;
  const dx = [-1, 0, 1, -1, 1, -1, 0, 1];
  const dy = [-1, -1, -1, 0, 0, 1, 1, 1];
  
  do {
    changed = false;
    for (let level = 0; level <= 255; level++) {
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = y * width + x;
          
          if (gradient[idx] === level && labels[idx] === 0) {
            let neighborLabels = new Set<number>();
            
            // Verificar vizinhos
            for (let i = 0; i < 8; i++) {
              const nx = x + dx[i];
              const ny = y + dy[i];
              const nidx = ny * width + nx;
              
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const neighborLabel = labels[nidx];
                if (neighborLabel > 0) {
                  neighborLabels.add(neighborLabel);
                }
              }
            }
            
            // Se tem exatamente um vizinho rotulado, propagar o rótulo
            if (neighborLabels.size === 1) {
              labels[idx] = Array.from(neighborLabels)[0];
              changed = true;
            }
            // Se tem mais de um vizinho com rótulos diferentes, é uma linha de contenção
            else if (neighborLabels.size > 1) {
              labels[idx] = -1; // Marca como linha de contenção
              changed = true;
            }
          }
        }
      }
    }
  } while (changed);

  // Marcar linhas de contenção em vermelho
  for (let i = 0; i < width * height; i++) {
    const pixelIdx = i * 4;
    if (labels[i] === -1) {
      resultData[pixelIdx] = 255;     // R
      resultData[pixelIdx + 1] = 0;   // G
      resultData[pixelIdx + 2] = 0;   // B
      resultData[pixelIdx + 3] = 255; // A
    }
  }

  ctx.putImageData(resultImageData, 0, 0);

  return {
    newBytes: await encode(canvas, ctx, resultImageData),
    newWidth: width,
    newHeight: height
  };
}