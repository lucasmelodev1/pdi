import { Button } from "@/components/ui/button";
import React, { useRef, useState } from "react";
import type { narutoCharacter } from "./lib/types";
import { Input } from "./components/ui/input";
import { dispatchTS, listenTS } from "./utils/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./components/ui/accordion";
import Scale from "./components/transformations/scale";
import Skew from "./components/transformations/skew";
import Rotation from "./components/transformations/rotation";
import Reflection from "./components/transformations/reflection";
import Translation from "./components/transformations/translation";
import ZoomIn from "./components/transformations/zoom-in";
import ZoomOut from "./components/transformations/zoom-out";
import {
  DivideIcon,
  MinusIcon,
  PlusIcon,
  Square,
  XIcon,
} from "lucide-react";
import GammaCorrection from "./components/transformations/gamma-correction";
import HistogramEqualization from "@/components/transformations/histogram-equalization";
import BitSlicing from "./components/transformations/bit-slicing";
import { useImageProcessing } from "@/hooks/use-image-processing";
import InvertColors from "@/components/transformations/invert-colors";
import SqrtTransform from "@/components/transformations/sqrt-transform";
import SquareTransform from "./components/transformations/square-transform";
import LogTransform from "./components/transformations/log-transform";
import ExpTransform from "./components/transformations/exp-transform";
import MeanFilter from "@/components/transformations/mean-filter";
import MedianFilter from "@/components/transformations/median-filter";
import MaxFilter from "@/components/transformations/max-filter";
import MinFilter from "@/components/transformations/min-filter";
import KawaharaFilter from "@/components/transformations/kawahara-filter";
import TomitaTsujiFilter from "@/components/transformations/tomita-tsuji-filter";
import NagaoMatsuyamaFilter from "@/components/transformations/nagao-matsuyama-filter";
import SomboonkaewFilter from "@/components/transformations/somboonkaew-filter";
import HighPassFilters from "@/components/transformations/high-pass-filters";
import HalftoningFilters from "@/components/transformations/halftoning";
import PointDetection from "@/components/transformations/point-detection";
import LineDetection from "@/components/transformations/line-detection";
import EdgeDetection from "@/components/transformations/edge-detection";
import Thresholding from "./components/transformations/thresholding";
import RegionGrowing from "@/components/transformations/region-growth";

interface PGMImage {
  width: number;
  height: number;
  pixels: Uint8ClampedArray;
}

function parsePGM(buffer: Uint8Array): PGMImage {
  const decoder = new TextDecoder();
  const headerChunk = decoder.decode(buffer.slice(0, 256));

  const magicNumberMatch = headerChunk.match(/^(P[25])/);
  if (!magicNumberMatch) {
    throw new Error("Invalid or unsupported PGM format. Only P2 (ASCII) and P5 (binary) are supported.");
  }
  const magicNumber = magicNumberMatch[1];

  const dimensionsRegex = /(?:^|\s+)(\d+)\s+(\d+)\s+(\d+)\s/;
  const dimensionsMatch = headerChunk.substring(magicNumber.length).replace(/#.*?\n/g, '\n').match(dimensionsRegex);

  if (!dimensionsMatch) {
    throw new Error("Could not parse PGM dimensions and max value from header.");
  }

  const [, widthStr, heightStr, maxValStr] = dimensionsMatch;
  const width = parseInt(widthStr, 10);
  const height = parseInt(heightStr, 10);
  const maxVal = parseInt(maxValStr, 10);

  if (maxVal > 255) {
    throw new Error("PGM files with a max value greater than 255 are not supported.");
  }

  const headerEndIndex = buffer.indexOf(10, magicNumberMatch.index! + dimensionsMatch.index! + dimensionsMatch[0].length) + 1;

  const rgbaPixels = new Uint8ClampedArray(width * height * 4);
  let pixelValues: number[] | Uint8Array;

  if (magicNumber === 'P2') {
    const pixelString = decoder.decode(buffer.slice(headerEndIndex));
    pixelValues = pixelString.trim().split(/\s+/).map(Number);
  } else {
    pixelValues = buffer.slice(headerEndIndex);
  }

  if (pixelValues.length < width * height) {
    throw new Error("PGM file data is incomplete or corrupted.");
  }

  for (let i = 0; i < width * height; i++) {
    const grayscaleValue = pixelValues[i];
    const pixelIndex = i * 4;
    const normalizedValue = (255 * grayscaleValue) / maxVal;
    rgbaPixels[pixelIndex] = normalizedValue;
    rgbaPixels[pixelIndex + 1] = normalizedValue;
    rgbaPixels[pixelIndex + 2] = normalizedValue;
    rgbaPixels[pixelIndex + 3] = 255;
  }

  return { width, height, pixels: rgbaPixels };
}

async function handleFile(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  let canvas: HTMLCanvasElement | null = null;

  try {
    switch (file.type) {
      case 'image/pgm':
      case 'image/x-portable-graymap':
      {
        console.log("Processing PGM image...");
        const buffer = await file.arrayBuffer();
        const { width, height, pixels } = parsePGM(new Uint8Array(buffer));

        canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Could not get 2D rendering context.");
        }
        const imageData = new ImageData(pixels, width, height);
        ctx.putImageData(imageData, 0, 0);
        break;
      }

      case 'image/png':
      case 'image/jpeg':
      case 'image/gif':
      case 'image/webp':
      case 'image/bmp': {
        console.log(`Processing ${file.type} image...`);
        canvas = await new Promise<HTMLCanvasElement>((resolve, reject) => {
          const img = new Image();
          const url = URL.createObjectURL(file);
          img.onload = () => {
            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = img.naturalWidth;
            tempCanvas.height = img.naturalHeight;
            const tempCtx = tempCanvas.getContext("2d");
            if (!tempCtx) {
              reject(new Error("Could not get 2D context for image canvas."));
              URL.revokeObjectURL(url);
              return;
            }
            tempCtx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);
            resolve(tempCanvas);
          };
          img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Failed to load image."));
          };
          img.src = url;
        });
        break;
      }

      default:
        throw new Error(`Unsupported file type: ${file.type || 'unknown'}`);
    }

    if (canvas) {
      const { width, height } = canvas;

      console.log("Canvas created:", canvas);

      canvas.toBlob((blob) => {
        if (!blob) {
          console.error("Could not convert canvas to blob.");
          return;
        }
        blob.arrayBuffer().then((pngBuffer) => {
          // Dispatch the action with the image data.
          dispatchTS("openImage", {
            buffer: pngBuffer,
            width,
            height,
          });
        }).catch(err => console.error("Error reading blob buffer:", err));
      }, "image/png");
    }
  } catch (err) {
    // Type-safe error handling
    if (err instanceof Error) {
      console.error("An error occurred:", err.message);
    } else {
      console.error("An unknown error occurred:", err);
    }
  } finally {
    // Reset file input to allow uploading the same file again
    target.value = "";
  }
}

export const App = () => {
  const [selectedSvg, setSelectedSvg] = useState<narutoCharacter>();
  const inputRef = useRef<HTMLInputElement>(null);

  useImageProcessing()

  const onClickCreate = () => {
    if (!selectedSvg) {
      return;
    }
    dispatchTS("createSvg", {
      svg: selectedSvg,
    });
  };

  const onClickClose = () => {
    dispatchTS("closePlugin", {});
  };

  return (
    <>
      <div className="flex h-full w-full flex-col items-center gap-4 overflow-y-scroll px-8 py-10">
        <h1 className="text-xl font-medium">PDI 2025</h1>
        <Accordion type="single" collapsible className="w-full">
          {/* 1. Operações */}
          <AccordionItem value="operations">
            <AccordionTrigger>Operações</AccordionTrigger>
            <OperationsAccordionItems />
          </AccordionItem>

          {/* 2. Transformações Geométricas */}
          <AccordionItem value="geometric-transformations">
            <AccordionTrigger>Transformações Geométricas</AccordionTrigger>
            <AccordionContent className="grid grid-cols-5 gap-3">
              <Scale />
              <Skew />
              <Rotation />
              <Reflection />
              <Translation />
              <ZoomIn />
              <ZoomOut />
            </AccordionContent>
          </AccordionItem>

          {/* 3. Ajustes de Intensidade */}
          <AccordionItem value="intensity-adjustments">
            <AccordionTrigger>Ajustes de Intensidade</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-gray-600 pb-1">Lineares</p>
              <div className="grid grid-cols-5 gap-3 mb-4">
                <GammaCorrection />
                <HistogramEqualization />
                <BitSlicing />
                <InvertColors />
              </div>
              <p className="text-sm text-gray-600 pb-1">Não-Lineares</p>
              <div className="grid grid-cols-5 gap-3 mb-4">
                <LogTransform />
                <SqrtTransform />
                <ExpTransform />
                <SquareTransform />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 4. Filtros Espaciais */}
          <AccordionItem value="spatial-filters">
            <AccordionTrigger>Filtros Espaciais</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-gray-600 pb-1">Passa-Baixa</p>
              <div className="grid grid-cols-5 gap-3 mb-4">
                <MeanFilter />
                <MedianFilter />
                <MaxFilter />
                <MinFilter />
              </div>
              <p className="text-sm text-gray-600 pb-1">Passa-Alta</p>
              <div className="mb-4">
                <HighPassFilters />
              </div>
              <p className="text-sm text-gray-600 pb-1">Preservação de Bordas</p>
              <div className="grid grid-cols-5 gap-3 mb-4">
                <KawaharaFilter />
                <TomitaTsujiFilter />
                <NagaoMatsuyamaFilter />
                <SomboonkaewFilter />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 5. Limiarização */}
          <AccordionItem value="thresholding">
            <AccordionTrigger>Limiarização</AccordionTrigger>
            <AccordionContent>
              <Thresholding />
            </AccordionContent>
          </AccordionItem>

          {/* 6. Meios-Tons */}
          <AccordionItem value="halftoning">
            <AccordionTrigger>Meios-Tons</AccordionTrigger>
            <AccordionContent>
              <HalftoningFilters />
            </AccordionContent>
          </AccordionItem>

          {/* 7. Detecção de Estruturas */}
          <AccordionItem value="structure-detection">
            <AccordionTrigger>Detecção de Estruturas</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-gray-600 pb-1">Pontos e Retas</p>
              <div className="grid grid-cols-5 gap-3 mb-4">
                <PointDetection />
                <LineDetection />
              </div>
              <p className="text-sm text-gray-600 pb-1">Bordas</p>
              <div>
                <EdgeDetection />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 8. Cores */}
          <AccordionItem value="color">
            <AccordionTrigger>Cores</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-gray-600 pb-1">Decomposição</p>
              <div className="mb-4">
                <ColorDecompositionAccordionItems />
              </div>
              <p className="text-sm text-gray-600 pb-1 mt-4">Pseudocolorização</p>
              <div className="grid grid-cols-5 gap-3">
                <Button
                  onClick={() =>
                    dispatchTS("pseudocolorization", {
                      style: "heatmap",
                    })
                  }
                >
                  Mapa de Calor
                </Button>
                <Button
                  onClick={() =>
                    dispatchTS("pseudocolorization", {
                      style: "falseColor",
                    })
                  }
                >
                  Realce Por Falsa Cor
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
          {/* Adicione dentro do AccordionItem apropriado (sugiro criar um novo para "Segmentação") */}
          <AccordionItem value="segmentation">
            <AccordionTrigger>Segmentação</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-5 gap-3 mb-4">
                <RegionGrowing />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <Input
          type="file"
          ref={inputRef}
          className="invisible"
          onChange={handleFile}
        />
        <div className="absolute bottom-4 right-4 flex flex-row gap-2">
          <Button
            onClick={() => {
              // Atalho para operação XOR
              dispatchTS("operation", { operation: "xor" });
            }}
            variant="default"
            size="icon"
            title="Comparar imagens (XOR)"
          >
            {/* Ícone de comparação: dois quadrados sobrepostos */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-compare"
            >
              <rect x="3" y="3" width="13" height="13" rx="2" />
              <rect x="8" y="8" width="13" height="13" rx="2" />
            </svg>
          </Button>
          <Button
            onClick={() => inputRef.current?.click()}
            size="icon"
            title="Adicionar imagem"
          >
            +
          </Button>
        </div>
        {/* <div className="flex flex-row gap-4">
          <Button onClick={onClickCreate} size={"sm"}>
            Create
          </Button>
          <Button variant={"destructive"} size={"sm"} onClick={onClickClose}>
            Close
          </Button>
        </div> */}
      </div>
    </>
  );
};

function OperationsAccordionItems() {
  return (
    <AccordionContent className="grid grid-cols-5 gap-3">
      <Button
        className="flex h-24 w-full flex-col items-center gap-2"
        onClick={() => {
          dispatchTS("operation", {
            operation: "sum",
          });
        }}
      >
        <PlusIcon />
        <span className="whitespace-normal">Soma</span>
      </Button>
      <Button
        className="flex h-24 w-full flex-col items-center gap-2"
        onClick={() => {
          dispatchTS("operation", {
            operation: "subtract",
          });
        }}
      >
        <MinusIcon />
        <span className="whitespace-normal">Subtração</span>
      </Button>
      <Button
        className="flex h-24 w-full flex-col items-center gap-2"
        onClick={() => {
          dispatchTS("operation", {
            operation: "multiplication",
          });
        }}
      >
        <XIcon />
        <span className="whitespace-normal">Multiplicação</span>
      </Button>
      <Button
        className="flex h-24 w-full flex-col items-center gap-2"
        onClick={() => {
          dispatchTS("operation", {
            operation: "division",
          });
        }}
      >
        <DivideIcon />
        <span className="whitespace-normal">Divisão</span>
      </Button>
      <Button
        className="flex h-24 w-full flex-col items-center gap-2"
        onClick={() => {
          dispatchTS("operation", {
            operation: "and",
          });
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="lucide lucide-squares-intersect-icon lucide-squares-intersect"
        >
          <path d="M10 22a2 2 0 0 1-2-2" />
          <path d="M14 2a2 2 0 0 1 2 2" />
          <path d="M16 22h-2" />
          <path d="M2 10V8" />
          <path d="M2 4a2 2 0 0 1 2-2" />
          <path d="M20 8a2 2 0 0 1 2 2" />
          <path d="M22 14v2" />
          <path d="M22 20a2 2 0 0 1-2 2" />
          <path d="M4 16a2 2 0 0 1-2-2" />
          <path d="M8 10a2 2 0 0 1 2-2h5a1 1 0 0 1 1 1v5a2 2 0 0 1-2 2H9a1 1 0 0 1-1-1z" />
          <path d="M8 2h2" />
        </svg>
        <span className="whitespace-normal">AND</span>
      </Button>
      <Button
        className="flex h-24 w-full flex-col items-center gap-2"
        onClick={() => {
          dispatchTS("operation", {
            operation: "or",
          });
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="lucide lucide-squares-unite-icon lucide-squares-unite"
        >
          <path d="M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3a1 1 0 0 0 1 1h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-3a1 1 0 0 0-1-1z" />
        </svg>
        <span className="whitespace-normal">OR</span>
      </Button>
      <Button
        className="flex h-24 w-full flex-col items-center gap-2"
        onClick={() => {
          dispatchTS("operation", {
            operation: "xor",
          });
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="lucide lucide-squares-exclude-icon lucide-squares-exclude"
        >
          <path d="M16 12v2a2 2 0 0 1-2 2H9a1 1 0 0 0-1 1v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h0" />
          <path d="M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3a1 1 0 0 1-1 1h-5a2 2 0 0 0-2 2v2" />
        </svg>
        <span className="whitespace-normal">XOR</span>
      </Button>
    </AccordionContent>
  );
}

function ColorDecompositionAccordionItems() {
  return (
    <AccordionContent className="grid grid-cols-5 gap-3">
      <Button
        className="flex h-24 w-full flex-col items-center gap-2"
        onClick={() =>
          dispatchTS("decompose", {
            colorSpectrum: "rgb",
          })
        }
      >
        <div className="flex items-center gap-2">
          <Square className="size-5 fill-red-500" />
          <Square className="size-5 fill-green-500" />
          <Square className="size-5 fill-blue-500" />
        </div>
        <span className="whitespace-normal">RGB</span>
      </Button>
      <Button
        className="flex h-24 w-full flex-col items-center gap-2"
        onClick={() =>
          dispatchTS("decompose", {
            colorSpectrum: "cmyk",
          })
        }
      >
        <div className="flex items-center gap-2">
          <Square className="size-5 fill-cyan-500" />
          <Square className="size-5 fill-pink-600" />
          <Square className="size-5 fill-yellow-500" />
          <Square className="size-5 fill-gray-500" />
        </div>
        <span className="whitespace-normal">CMYK</span>
      </Button>
      <Button
        className="flex h-24 w-full flex-col items-center gap-2"
        onClick={() =>
          dispatchTS("decompose", {
            colorSpectrum: "cmy",
          })
        }
      >
        <div className="flex items-center gap-2">
          <Square className="size-5 fill-cyan-500" />
          <Square className="size-5 fill-pink-600" />
          <Square className="size-5 fill-yellow-500" />
        </div>
        <span className="whitespace-normal">CMY</span>
      </Button>
      <Button
        className="flex h-24 w-full flex-col items-center gap-2"
        onClick={() =>
          dispatchTS("decompose", {
            colorSpectrum: "yuv",
          })
        }
      >
        <div className="flex items-center gap-2">
          <Square className="size-5 fill-blue-500" />
          <Square className="size-5 fill-orange-600" />
          <Square className="size-5 fill-gray-500" />
        </div>
        <span className="whitespace-normal">YUV</span>
      </Button>
      <Button
        onClick={() =>
          dispatchTS("decompose", {
            colorSpectrum: "hsb",
          })
        }
      >
        <span className="whitespace-normal">HSB</span>
      </Button>
      <Button
        onClick={() =>
          dispatchTS("decompose", {
            colorSpectrum: "hsl",
          })
        }
      >
        <span className="whitespace-normal">HSL</span>
      </Button>
    </AccordionContent>
  );
}