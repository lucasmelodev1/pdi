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
import {
  applySpatialFilter,
  maxProcessor,
  meanProcessor,
  medianProcessor,
  minProcessor,
  modeProcessor,
} from "@/utils/transformations/spatial-filter";
import {
  applyEdgePreservingFilter,
  kawaharaStrategy, nagaoMatsuyamaStrategy, somboonkaewStrategy,
  tomitaTsujiStrategy
} from "@/utils/transformations/edge-preserving-filter";
import { highPassFilter, highPassBoostFilter } from "@/utils/transformations/high-pass-filters";
import { orderedDither, floydSteinbergDither, rogersDither, jarvisJudiceNinkeDither, stuckiDither, stevensonArceDither } from "@/utils/transformations/halftoning";
import { pointDetection, lineDetection } from "@/utils/transformations/point-detection";
import { robertsEdge, robertsCrossEdge, prewittGx, prewittGy, prewittMagnitude, sobelGx, sobelGy, sobelMagnitude, kirschEdge, robinsonEdge, freyChenEdge, laplacianH1, laplacianH2 } from "@/utils/transformations/edge-detection";
import { globalThreshold, localMeanThreshold, localMaxThreshold, localMinThreshold, niblackThreshold } from "@/utils/transformations/thresholding";
import regionGrowing from "@/utils/transformations/region-growth";

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
  "mean": (t: Transformation, bytes: Uint8Array) => applySpatialFilter(bytes, (t as any).kernelSize, meanProcessor),
  "median": (t: Transformation, bytes: Uint8Array) => applySpatialFilter(bytes, (t as any).kernelSize, medianProcessor),
  "max": (_t: Transformation, bytes: Uint8Array) => applySpatialFilter(bytes, 3, maxProcessor),
  "min": (_t: Transformation, bytes: Uint8Array) => applySpatialFilter(bytes, 3, minProcessor),
  "mode": (_t: Transformation, bytes: Uint8Array) => applySpatialFilter(bytes, 3, modeProcessor),
  "kawahara": (_t: Transformation, bytes: Uint8Array) => applyEdgePreservingFilter(bytes, kawaharaStrategy),
  "tomitaTsuji": (_t: Transformation, bytes: Uint8Array) => applyEdgePreservingFilter(bytes, tomitaTsujiStrategy),
  "nagaoMatsuyama": (_t: Transformation, bytes: Uint8Array) => applyEdgePreservingFilter(bytes, nagaoMatsuyamaStrategy),
  "somboonkaew": (_t: Transformation, bytes: Uint8Array) => applyEdgePreservingFilter(bytes, somboonkaewStrategy),
  "highPass": (t: Transformation, bytes: Uint8Array) => highPassFilter(bytes, (t as any).filterType),
  "highPassBoost": (t: Transformation, bytes: Uint8Array) => highPassBoostFilter(bytes, (t as any).boostFactor ?? 1.5),
  "orderedDither": (t: Transformation, bytes: Uint8Array) => orderedDither(bytes, (t as any).matrix),
  "floydSteinbergDither": (_t: Transformation, bytes: Uint8Array) => floydSteinbergDither(bytes),
  "rogersDither": (_t: Transformation, bytes: Uint8Array) => rogersDither(bytes),
  "jarvisJudiceNinkeDither": (_t: Transformation, bytes: Uint8Array) => jarvisJudiceNinkeDither(bytes),
  "stuckiDither": (_t: Transformation, bytes: Uint8Array) => stuckiDither(bytes),
  "stevensonArceDither": (_t: Transformation, bytes: Uint8Array) => stevensonArceDither(bytes),
  "pointDetection": (t: Transformation, bytes: Uint8Array) => pointDetection(bytes, (t as any).T),
  "lineDetection": (t: Transformation, bytes: Uint8Array) => lineDetection(bytes, (t as any).direction, (t as any).T),
  "robertsEdge": (_t: Transformation, bytes: Uint8Array) => robertsEdge(bytes),
  "robertsCrossEdge": (_t: Transformation, bytes: Uint8Array) => robertsCrossEdge(bytes),
  "prewittGx": (_t: Transformation, bytes: Uint8Array) => prewittGx(bytes),
  "prewittGy": (_t: Transformation, bytes: Uint8Array) => prewittGy(bytes),
  "prewittMagnitude": (_t: Transformation, bytes: Uint8Array) => prewittMagnitude(bytes),
  "sobelGx": (_t: Transformation, bytes: Uint8Array) => sobelGx(bytes),
  "sobelGy": (_t: Transformation, bytes: Uint8Array) => sobelGy(bytes),
  "sobelMagnitude": (_t: Transformation, bytes: Uint8Array) => sobelMagnitude(bytes),
  "kirschEdge": (_t: Transformation, bytes: Uint8Array) => kirschEdge(bytes),
  "robinsonEdge": (_t: Transformation, bytes: Uint8Array) => robinsonEdge(bytes),
  "freyChenEdge": (_t: Transformation, bytes: Uint8Array) => freyChenEdge(bytes),
  "laplacianH1": (_t: Transformation, bytes: Uint8Array) => laplacianH1(bytes),
  "laplacianH2": (_t: Transformation, bytes: Uint8Array) => laplacianH2(bytes),
  "globalThreshold": (t: Transformation, bytes: Uint8Array) => globalThreshold(bytes, (t as any).threshold),
  "localMeanThreshold": (t: Transformation, bytes: Uint8Array) => localMeanThreshold(bytes, (t as any).windowSize),
  "localMaxThreshold": (t: Transformation, bytes: Uint8Array) => localMaxThreshold(bytes, (t as any).windowSize),
  "localMinThreshold": (t: Transformation, bytes: Uint8Array) => localMinThreshold(bytes, (t as any).windowSize),
  "niblackThreshold": (t: Transformation, bytes: Uint8Array) => niblackThreshold(bytes, (t as any).windowSize, (t as any).k),
  "regionGrowing": (t: Transformation, bytes: Uint8Array) => 
    regionGrowing(bytes, (t as any).seedX, (t as any).seedY, (t as any).threshold),
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
            pixels[i] = pixels2[i] === 0 ? 255 : Math.min(255, (pixels[i] * 255) / pixels2[i]);
            pixels[i + 1] = pixels2[i + 1] === 0 ? 255 : Math.min(255, (pixels[i + 1] * 255) / pixels2[i + 1]);
            pixels[i + 2] = pixels2[i + 2] === 0 ? 255 : Math.min(255, (pixels[i + 2] * 255) / pixels2[i + 2]);
            break;
          case "multiplication":
            pixels[i] = (pixels[i] * pixels2[i]) / 255;
            pixels[i + 1] = (pixels[i + 1] * pixels2[i + 1]) / 255;
            pixels[i + 2] = (pixels[i + 2] * pixels2[i + 2]) / 255;
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