import decode from "../decode";
import encode from "../encode";

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  (r /= 255), (g /= 255), (b /= 255);
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // Acromático
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [r * 255, g * 255, b * 255];
}

export default async function histogramEqualization(
  bytes: Uint8Array
): Promise<{
  newBytes: Uint8Array;
  newWidth: number;
  newHeight: number;
}> {
  const originalCanvas = document.createElement("canvas");
  const originalCtx = originalCanvas.getContext("2d")!;
  const imageData = await decode(originalCanvas, originalCtx, bytes);

  const srcData = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const totalPixels = width * height;

  const histogram = new Array(256).fill(0);
  const hslPixels = [];

  for (let i = 0; i < srcData.length; i += 4) {
    const [h, s, l] = rgbToHsl(srcData[i], srcData[i + 1], srcData[i + 2]);
    hslPixels.push({ h, s, l });
    const l_quantized = Math.round(l * 255);
    histogram[l_quantized]++;
  }

  const cdf = new Array(256).fill(0);
  cdf[0] = histogram[0];
  for (let i = 1; i < 256; i++) {
    cdf[i] = cdf[i - 1] + histogram[i];
  }

  let cdf_min = 0;
  for (let i = 0; i < 256; i++) {
    if (cdf[i] > 0) {
      cdf_min = cdf[i];
      break;
    }
  }

  const lut = new Uint8Array(256);
  const denominator = totalPixels - cdf_min;

  if (denominator <= 0) {
    for (let i = 0; i < 256; i++) lut[i] = i;
  } else {
    for (let i = 0; i < 256; i++) {
      lut[i] = Math.round(((cdf[i] - cdf_min) / denominator) * 255);
    }
  }

  const newCanvas = document.createElement("canvas");
  newCanvas.width = width;
  newCanvas.height = height;
  const newCtx = newCanvas.getContext("2d")!;
  const newImageData = newCtx.createImageData(width, height);
  const destData = newImageData.data;

  for (let i = 0; i < hslPixels.length; i++) {
    const { h, s } = hslPixels[i];
    const old_l_quantized = Math.round(hslPixels[i].l * 255);
    const new_l = lut[old_l_quantized] / 255;

    const [r, g, b] = hslToRgb(h, s, new_l);

    const index = i * 4;
    destData[index] = r;
    destData[index + 1] = g;
    destData[index + 2] = b;
    destData[index + 3] = srcData[index + 3]; // Manter o canal alfa original
  }

  newCtx.putImageData(newImageData, 0, 0);
  return {
    newBytes: await encode(newCanvas, newCtx, newImageData),
    newWidth: width,
    newHeight: height
  };
}