import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import type { narutoCharacter } from "./lib/types";
import { Input } from "./components/ui/input";
import { parsePGM } from "./utils/pgm";
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

async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  if (!file) return;

  const buffer = await file.arrayBuffer();
  const { width, height, pixels } = parsePGM(new Uint8Array(buffer));

  // Draw to canvas
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const imageData = new ImageData(pixels, width, height);
  ctx.putImageData(imageData, 0, 0);

  canvas.toBlob((blob) => {
    if (!blob) return;
    blob.arrayBuffer().then((pngBuffer) => {
      dispatchTS("openImage", {
        buffer: pngBuffer,
        width,
        height,
      });
    });
  }, "image/png");
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
          <AccordionItem value="item-1">
            <AccordionTrigger>Operações</AccordionTrigger>
            <OperationsAccordionItems />
          </AccordionItem>
          <AccordionItem value="transformation">
            <AccordionTrigger>Transformações</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4">
              <p className={"text-sm text-gray-600"}>Básicos</p>
              <div className={"grid grid-cols-4 gap-4 mb-4"}>
                <Scale />
                <Skew />
                <Rotation />
                <Reflection />
                <Translation />
                <ZoomIn />
                <ZoomOut />
              </div>

              <p className={"text-sm text-gray-600"}>Transformações Lineares</p>
              <div className={"grid grid-cols-4 gap-4 mb-4"}>
                <GammaCorrection />
                <HistogramEqualization />
                <BitSlicing />
                <InvertColors />
              </div>

              <p className={"text-sm text-gray-600"}>Operações Não-Lineares</p>
              <div className={"grid grid-cols-4 gap-4 mb-4"}>
                <LogTransform />
                <SqrtTransform />
                <ExpTransform />
                <SquareTransform />
              </div>

              <p className={"text-sm text-gray-600"}>Filtros Passa-Baixa</p>
              <div className={"grid grid-cols-4 gap-4 mb-4"}>
                <MeanFilter />
                <MedianFilter />
                <MaxFilter />
                <MinFilter />
              </div>

              <p className={"text-sm text-gray-600"}>Filtros Passa-Alta</p>
              <HighPassFilters />

              <p className={"text-sm text-gray-600"}>Meios-Tons (Halftoning)</p>
              <HalftoningFilters />

              <p className={"text-sm text-gray-600"}>Detecção de Pontos e Retas</p>
              <div className={"grid grid-cols-4 gap-4 mb-4"}>
                <PointDetection />
                <LineDetection />
              </div>

              <p className={"text-sm text-gray-600"}>Detecção de Bordas</p>
              <EdgeDetection />

              <p className={"text-sm text-gray-600"}>Filtros de Preservação de Bordas</p>
              <div className={"grid grid-cols-4 gap-4 mb-4"}>
                <KawaharaFilter />
                <TomitaTsujiFilter />
                <NagaoMatsuyamaFilter />
                <SomboonkaewFilter />
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="color-decomposition">
            <AccordionTrigger>Decomposição de Cores</AccordionTrigger>
            <ColorDecompositionAccordionItems />
          </AccordionItem>
          <AccordionItem value="pseudocolorization">
            <AccordionTrigger>Pseudocolorização</AccordionTrigger>
            <AccordionContent className="grid grid-cols-4 gap-4">
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
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <Input
          type="file"
          ref={inputRef}
          className="invisible"
          onChange={handleFile}
        />
        <Button
          className="absolute bottom-4 right-4"
          onClick={() => inputRef.current?.click()}
        >
          +
        </Button>
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
    <AccordionContent className="grid grid-cols-4 gap-4">
      <Button
        className="flex h-24 w-full flex-col items-center gap-2"
        onClick={() => {
          dispatchTS("operation", {
            operation: "sum",
          });
        }}
      >
        <PlusIcon />
        Soma
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
        Subtração
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
        Multiplicação
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
        Divisão
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
        AND
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
        OR
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
        XOR
      </Button>
    </AccordionContent>
  );
}

function ColorDecompositionAccordionItems() {
  return (
    <AccordionContent className="grid grid-cols-4 gap-4">
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
        RGB
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
        CMYK
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
        CMY
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
        YUV
      </Button>
      <Button
        onClick={() =>
          dispatchTS("decompose", {
            colorSpectrum: "hsb",
          })
        }
      >
        HSB
      </Button>
      <Button
        onClick={() =>
          dispatchTS("decompose", {
            colorSpectrum: "hsl",
          })
        }
      >
        HSL
      </Button>
    </AccordionContent>
  );
}
