import decode from "../decode";
import encode from "../encode";

// Laplaciano H1
export async function laplacianH1(bytes: Uint8Array): Promise<{ newBytes: Uint8Array; newWidth: number; newHeight: number }> {
  const kernel = [
    [0, -1, 0],
    [-1, 4, -1],
    [0, -1, 0],
  ];
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
          const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          sum += gray * kernel[ky + 1][kx + 1];
        }
      }
      const value = Math.min(255, Math.abs(sum));
      const idx = (y * width + x) * 4;
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

// Laplaciano H2
export async function laplacianH2(bytes: Uint8Array): Promise<{ newBytes: Uint8Array; newWidth: number; newHeight: number }> {
  const kernel = [
    [-1, -1, -1],
    [-1, 8, -1],
    [-1, -1, -1],
  ];
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
          const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          sum += gray * kernel[ky + 1][kx + 1];
        }
      }
      const value = Math.min(255, Math.abs(sum));
      const idx = (y * width + x) * 4;
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

// Roberts
export async function robertsEdge(bytes: Uint8Array): Promise<{ newBytes: Uint8Array; newWidth: number; newHeight: number }> {
  // Roberts kernels (2x2)
  const Gx = [
    [1, 0],
    [0, -1],
  ];
  const Gy = [
    [0, 1],
    [-1, 0],
  ];
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const imageData = await decode(canvas, ctx, bytes);
  const { data, width, height } = imageData;
  const newImageData = ctx.createImageData(width, height);
  const dest = newImageData.data;

  for (let y = 0; y < height - 1; y++) {
    for (let x = 0; x < width - 1; x++) {
      let sumX = 0;
      let sumY = 0;
      for (let ky = 0; ky < 2; ky++) {
        for (let kx = 0; kx < 2; kx++) {
          const px = x + kx;
          const py = y + ky;
          const idx = (py * width + px) * 4;
          // Luminância
          const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          sumX += gray * Gx[ky][kx];
          sumY += gray * Gy[ky][kx];
        }
      }
      const mag = Math.sqrt(sumX * sumX + sumY * sumY);
      const value = Math.min(255, Math.abs(mag));
      const idx = (y * width + x) * 4;
      dest[idx] = dest[idx + 1] = dest[idx + 2] = value;
      dest[idx + 3] = data[idx + 3];
    }
  }
  // Copia bordas sem filtro
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (y === height - 1 || x === width - 1) {
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

// Roberts cruzado
export async function robertsCrossEdge(bytes: Uint8Array): Promise<{ newBytes: Uint8Array; newWidth: number; newHeight: number }> {
  // Roberts cross kernels (2x2)
  const Gx = [
    [1, -1],
    [1, -1],
  ];
  const Gy = [
    [-1, -1],
    [1, 1],
  ];
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const imageData = await decode(canvas, ctx, bytes);
  const { data, width, height } = imageData;
  const newImageData = ctx.createImageData(width, height);
  const dest = newImageData.data;

  for (let y = 0; y < height - 1; y++) {
    for (let x = 0; x < width - 1; x++) {
      let sumX = 0;
      let sumY = 0;
      for (let ky = 0; ky < 2; ky++) {
        for (let kx = 0; kx < 2; kx++) {
          const px = x + kx;
          const py = y + ky;
          const idx = (py * width + px) * 4;
          // Luminância
          const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          sumX += gray * Gx[ky][kx];
          sumY += gray * Gy[ky][kx];
        }
      }
      const mag = Math.sqrt(sumX * sumX + sumY * sumY);
      const value = Math.min(255, Math.abs(mag));
      const idx = (y * width + x) * 4;
      dest[idx] = dest[idx + 1] = dest[idx + 2] = value;
      dest[idx + 3] = data[idx + 3];
    }
  }
  // Copia bordas sem filtro
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (y === height - 1 || x === width - 1) {
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

// Prewitt Gx
export async function prewittGx(bytes: Uint8Array): Promise<{ newBytes: Uint8Array; newWidth: number; newHeight: number }> {
  const kernel = [
    [-1, 0, 1],
    [-1, 0, 1],
    [-1, 0, 1],
  ];
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
          const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          sum += gray * kernel[ky + 1][kx + 1];
        }
      }
      const value = Math.min(255, Math.abs(sum));
      const idx = (y * width + x) * 4;
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

// Prewitt Gy
export async function prewittGy(bytes: Uint8Array): Promise<{ newBytes: Uint8Array; newWidth: number; newHeight: number }> {
  const kernel = [
    [1, 1, 1],
    [0, 0, 0],
    [-1, -1, -1],
  ];
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
          const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          sum += gray * kernel[ky + 1][kx + 1];
        }
      }
      const value = Math.min(255, Math.abs(sum));
      const idx = (y * width + x) * 4;
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

// Prewitt Magnitude
export async function prewittMagnitude(bytes: Uint8Array): Promise<{ newBytes: Uint8Array; newWidth: number; newHeight: number }> {
  const kernelGx = [
    [-1, 0, 1],
    [-1, 0, 1],
    [-1, 0, 1],
  ];
  const kernelGy = [
    [1, 1, 1],
    [0, 0, 0],
    [-1, -1, -1],
  ];
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const imageData = await decode(canvas, ctx, bytes);
  const { data, width, height } = imageData;
  const newImageData = ctx.createImageData(width, height);
  const dest = newImageData.data;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sumX = 0;
      let sumY = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const px = x + kx;
          const py = y + ky;
          const idx = (py * width + px) * 4;
          const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          sumX += gray * kernelGx[ky + 1][kx + 1];
          sumY += gray * kernelGy[ky + 1][kx + 1];
        }
      }
      const mag = Math.sqrt(sumX * sumX + sumY * sumY);
      const value = Math.min(255, Math.abs(mag));
      const idx = (y * width + x) * 4;
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

// Sobel Gx
export async function sobelGx(bytes: Uint8Array): Promise<{ newBytes: Uint8Array; newWidth: number; newHeight: number }> {
  const kernel = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1],
  ];
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
          const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          sum += gray * kernel[ky + 1][kx + 1];
        }
      }
      const value = Math.min(255, Math.abs(sum));
      const idx = (y * width + x) * 4;
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

// Sobel Gy
export async function sobelGy(bytes: Uint8Array): Promise<{ newBytes: Uint8Array; newWidth: number; newHeight: number }> {
  const kernel = [
    [1, 2, 1],
    [0, 0, 0],
    [-1, -2, -1],
  ];
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
          const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          sum += gray * kernel[ky + 1][kx + 1];
        }
      }
      const value = Math.min(255, Math.abs(sum));
      const idx = (y * width + x) * 4;
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

// Sobel Magnitude
export async function sobelMagnitude(bytes: Uint8Array): Promise<{ newBytes: Uint8Array; newWidth: number; newHeight: number }> {
  const kernelGx = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1],
  ];
  const kernelGy = [
    [1, 2, 1],
    [0, 0, 0],
    [-1, -2, -1],
  ];
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const imageData = await decode(canvas, ctx, bytes);
  const { data, width, height } = imageData;
  const newImageData = ctx.createImageData(width, height);
  const dest = newImageData.data;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sumX = 0;
      let sumY = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const px = x + kx;
          const py = y + ky;
          const idx = (py * width + px) * 4;
          const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          sumX += gray * kernelGx[ky + 1][kx + 1];
          sumY += gray * kernelGy[ky + 1][kx + 1];
        }
      }
      const mag = Math.sqrt(sumX * sumX + sumY * sumY);
      const value = Math.min(255, Math.abs(mag));
      const idx = (y * width + x) * 4;
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

// Kirsch
export async function kirschEdge(bytes: Uint8Array): Promise<{ newBytes: Uint8Array; newWidth: number; newHeight: number }> {
  const kernels = [
    [[5, 5, 5], [-3, 0, -3], [-3, -3, -3]],
    [[5, 5, -3], [5, 0, -3], [-3, -3, -3]],
    [[5, -3, -3], [5, 0, -3], [5, -3, -3]],
    [[-3, -3, -3], [5, 0, -3], [5, 5, -3]],
    [[-3, -3, -3], [-3, 0, -3], [5, 5, 5]],
    [[-3, -3, -3], [-3, 0, 5], [-3, 5, 5]],
    [[-3, -3, 5], [-3, 0, 5], [-3, -3, 5]],
    [[-3, 5, 5], [-3, 0, 5], [-3, -3, -3]],
  ];
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const imageData = await decode(canvas, ctx, bytes);
  const { data, width, height } = imageData;
  const newImageData = ctx.createImageData(width, height);
  const dest = newImageData.data;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let maxVal = 0;
      for (const kernel of kernels) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const px = x + kx;
            const py = y + ky;
            const idx = (py * width + px) * 4;
            const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
            sum += gray * kernel[ky + 1][kx + 1];
          }
        }
        maxVal = Math.max(maxVal, Math.abs(sum));
      }
      const value = Math.min(255, maxVal);
      const idx = (y * width + x) * 4;
      dest[idx] = dest[idx + 1] = dest[idx + 2] = value;
      dest[idx + 3] = data[idx + 3];
    }
  }
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

// Robinson
export async function robinsonEdge(bytes: Uint8Array): Promise<{ newBytes: Uint8Array; newWidth: number; newHeight: number }> {
  const kernels = [
    [[1, 0, -1], [2, 0, -2], [1, 0, -1]],
    [[0, -1, -2], [1, 0, -1], [2, 1, 0]],
    [[-1, -2, -1], [0, 0, 0], [1, 2, 1]],
    [[-2, -1, 0], [-1, 0, 1], [0, 1, 2]],
    [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]],
    [[0, 1, 2], [-1, 0, 1], [-2, -1, 0]],
    [[1, 2, 1], [0, 0, 0], [-1, -2, -1]],
    [[2, 1, 0], [1, 0, -1], [0, -1, -2]],
  ];
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const imageData = await decode(canvas, ctx, bytes);
  const { data, width, height } = imageData;
  const newImageData = ctx.createImageData(width, height);
  const dest = newImageData.data;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let maxVal = 0;
      for (const kernel of kernels) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const px = x + kx;
            const py = y + ky;
            const idx = (py * width + px) * 4;
            const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
            sum += gray * kernel[ky + 1][kx + 1];
          }
        }
        maxVal = Math.max(maxVal, Math.abs(sum));
      }
      const value = Math.min(255, maxVal);
      const idx = (y * width + x) * 4;
      dest[idx] = dest[idx + 1] = dest[idx + 2] = value;
      dest[idx + 3] = data[idx + 3];
    }
  }
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

// Frey-Chen
export async function freyChenEdge(bytes: Uint8Array): Promise<{ newBytes: Uint8Array; newWidth: number; newHeight: number }> {
  const kernel = [
    [0, 0, -1],
    [0, 1, 0],
    [1, 0, 0],
  ];
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
          const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          sum += gray * kernel[ky + 1][kx + 1];
        }
      }
      const value = Math.min(255, Math.abs(sum));
      const idx = (y * width + x) * 4;
      dest[idx] = dest[idx + 1] = dest[idx + 2] = value;
      dest[idx + 3] = data[idx + 3];
    }
  }
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