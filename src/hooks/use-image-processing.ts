import { useEffect } from "react";
import { listenTS, dispatchTS } from "@/utils/utils";

import scale from "@/utils/transformations/scale";
import skew from "@/utils/transformations/skew";
import rotation from "@/utils/transformations/rotation";
import reflection from "@/utils/transformations/reflection";
import translation from "@/utils/transformations/translation";
import zoomIn from "@/utils/transformations/zoom-in";
import zoomOut from "@/utils/transformations/zoom-out";
import gammaCorrection from "@/utils/transformations/gamma-correction";
import histogramEqualization from "@/utils/transformations/histogram-equalization";
import bitSlicing from "@/utils/transformations/bit-slicing";
import decomposeRGB from "@/utils/decolorization/rgb";
import decomposeCMYK from "@/utils/decolorization/cmyk";
import decomposeCMY from "@/utils/decolorization/cmy";
import decomposeYUV from "@/utils/decolorization/yuv";
import decomposeHSB from "@/utils/decolorization/hsb";
import decomposeHSL from "@/utils/decolorization/hsl";
import heatmapPseudocolorize from "@/utils/pseudocolorization/heatmap";
import falseColorHighlight from "@/utils/pseudocolorization/false-color";
import decode from "@/utils/decode";
import encode from "@/utils/encode";
import type { Transformation } from "../../shared/universals";
import invertColors from "@/utils/transformations/invert";
import applyNonLinear from "@/utils/transformations/non-linear";

const transformationHandlers = {
  "scale": (t: Transformation, bytes: Uint8Array) => scale(bytes, (t as any).x, (t as any).y),
  "skew": (t: Transformation, bytes: Uint8Array) => skew(bytes, (t as any).x, (t as any).y),
  "rotation": (t: Transformation, bytes: Uint8Array) => rotation(bytes, (t as any).angle),
  "reflection": (t: Transformation, bytes: Uint8Array) => reflection(bytes, (t as any).horizontal, (t as any).vertical),
  "translation": (t: Transformation, bytes: Uint8Array) => translation(bytes, (t as any).x, (t as any).y),
  "zoomIn": (t: Transformation, bytes: Uint8Array) => zoomIn(bytes, (t as any).scale, (t as any).technique),
  "zoomOut": (t: Transformation, bytes: Uint8Array) => zoomOut(bytes, (t as any).scale, (t as any).technique),
  "gammaCorrection": (t: Transformation, bytes: Uint8Array) => gammaCorrection(bytes, (t as any).gamma),
  "histogramEqualization": (_t: Transformation, bytes: Uint8Array) => histogramEqualization(bytes),
  "invert": (t: Transformation, bytes: Uint8Array) => invertColors(bytes),
  "log": (_t: Transformation, bytes: Uint8Array) => applyNonLinear(bytes, 'log'),
  "sqrt": (_t: Transformation, bytes: Uint8Array) => applyNonLinear(bytes, 'sqrt'),
  "exp": (_t: Transformation, bytes: Uint8Array) => applyNonLinear(bytes, 'exp'),
  "square": (_t: Transformation, bytes: Uint8Array) => applyNonLinear(bytes, 'square'),
};

const decompositionHandlers = {
  rgb: decomposeRGB,
  cmyk: decomposeCMYK,
  cmy: decomposeCMY,
  yuv: decomposeYUV,
  hsb: decomposeHSB,
  hsl: decomposeHSL
};

const pseudocolorizationHandlers = {
  heatmap: heatmapPseudocolorize,
  falseColor: falseColorHighlight
};


export function useImageProcessing() {
  useEffect(() => {
    listenTS("transformationImage", async ({ transformation: t, bytes }) => {
      if (t.type === "bitSlicing") {
        const results = await bitSlicing(bytes);
        for (const result of results) {
          dispatchTS("openImage", {
            buffer: result.bytes,
            width: result.width,
            height: result.height
          });
        }
        return;
      }

      const handler = (transformationHandlers as any)[t.type];

      if (handler) {
        const { newBytes, newWidth, newHeight } = await handler(t, bytes);
        dispatchTS("openImage", {
          buffer: newBytes,
          width: newWidth,
          height: newHeight
        });
      } else {
        console.warn(`Nenhum handler de transformação encontrado para o tipo: ${t.type}`);
      }
    });

    listenTS("decomposeImage", async ({ bytes, colorSpectrum }) => {
      const handler = (decompositionHandlers as any)[colorSpectrum];

      if (handler) {
        const results = await handler(bytes);
        for (const result of results) {
          dispatchTS("openImage", {
            buffer: result.bytes,
            width: result.width,
            height: result.height
          });
        }
      } else {
        console.warn(`Nenhum handler de decomposição encontrado para o espectro: ${colorSpectrum}`);
      }
    });

    listenTS("pseudocolorizationImage", async ({ bytes, style }) => {
      const handler = (pseudocolorizationHandlers as any)[style];

      if (handler) {
        const result = await handler(bytes);
        dispatchTS("openImage", {
          buffer: result.bytes,
          width: result.width,
          height: result.height
        });
      } else {
        console.warn(`Nenhum handler de pseudocolorização encontrado para o estilo: ${style}`);
      }
    });

    listenTS("operationImage", async ({ operation, bytes, bytes2 }) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      const imageData = await decode(canvas, ctx, bytes);
      const imageData2 = await decode(canvas, ctx, bytes2);
      const pixels = imageData.data;
      const pixels2 = imageData2.data;

      for (let i = 0; i < pixels.length; i += 4) {
        switch (operation) {
          case "sum":
            pixels[i] += pixels2[i];
            pixels[i + 1] += pixels2[i + 1];
            pixels[i + 2] += pixels2[i + 2];
            break;
          case "subtract":
            pixels[i] -= pixels2[i];
            pixels[i + 1] -= pixels2[i + 1];
            pixels[i + 2] -= pixels2[i + 2];
            break;
          case "division":
            pixels[i] /= pixels2[i] || 1; // Evita divisão por zero
            pixels[i + 1] /= pixels2[i + 1] || 1;
            pixels[i + 2] /= pixels2[i + 2] || 1;
            break;
          case "multiplication":
            pixels[i] *= pixels2[i];
            pixels[i + 1] *= pixels2[i + 1];
            pixels[i + 2] *= pixels2[i + 2];
            break;
          case "and":
            pixels[i] &= pixels2[i];
            pixels[i + 1] &= pixels2[i + 1];
            pixels[i + 2] &= pixels2[i + 2];
            break;
          case "or":
            pixels[i] |= pixels2[i];
            pixels[i + 1] |= pixels2[i + 1];
            pixels[i + 2] |= pixels2[i + 2];
            break;
          case "xor":
            pixels[i] ^= pixels2[i];
            pixels[i + 1] ^= pixels2[i + 1];
            pixels[i + 2] ^= pixels2[i + 2];
            break;
        }
      }

      const newBytes = await encode(canvas, ctx, imageData);
      dispatchTS("openImage", {
        buffer: newBytes,
        height: imageData.height,
        width: imageData.width
      });
    });
  }, []);
}