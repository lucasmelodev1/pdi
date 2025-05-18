import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRef, useState } from "react";
import type { narutoCharacter } from "./lib/types";
import svgs from "./lib/svgs";
import { Input } from "./components/ui/input";
import { parsePGM } from "./utils/pgm";
import { dispatchTS, listenTS } from "./utils/utils";
import decode from "./utils/decode";
import encode from "./utils/encode";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./components/ui/accordion";
import scale from "./utils/transformations/scale";
import skew from "./utils/transformations/skew";
import Scale from "./components/transformations/scale";
import Skew from "./components/transformations/skew";
import Rotation from "./components/transformations/rotation";
import rotation from "./utils/transformations/rotation";
import Reflection from "./components/transformations/reflection";
import reflection from "./utils/transformations/reflection";
import translation from "./utils/transformations/translation";
import Translation from "./components/transformations/translation";
import zoomIn from "./utils/transformations/zoom-in";
import ZoomIn from "./components/transformations/zoom-in";
import ZoomOut from "./components/transformations/zoom-out";
import zoomOut from "./utils/transformations/zoom-out";
import decomposeRGB from "./utils/decolorization/rgb";
import decomposeCMYK from "./utils/decolorization/cmyk";
import decomposeCMY from "./utils/decolorization/cmy";
import decomposeYUV from "./utils/decolorization/yuv";
import decomposeHSB from "./utils/decolorization/hsb";
import decomposeHSL from "./utils/decolorization/hsl";
import heatmapPseudocolorize from "./utils/pseudocolorization/heatmap";

listenTS("operationImage", async ({ operation, bytes, bytes2 }) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  const imageData = await decode(canvas, ctx, bytes);
  const imageData2 = await decode(canvas, ctx, bytes2);
  const pixels = imageData.data;
  const pixels2 = imageData2.data;

  // Do the actual work of inverting the colors.
  for (let i = 0; i < pixels.length; i += 4) {
    switch (operation) {
      case "sum": {
        pixels[i + 0] = pixels[i + 0] + pixels2[i + 0];
        pixels[i + 1] = pixels[i + 1] + pixels2[i + 1];
        pixels[i + 2] = pixels[i + 2] + pixels2[i + 2];
        break;
      }
      case "subtract": {
        pixels[i + 0] = pixels[i + 0] - pixels2[i + 0];
        pixels[i + 1] = pixels[i + 1] - pixels2[i + 1];
        pixels[i + 2] = pixels[i + 2] - pixels2[i + 2];
        break;
      }
      case "division": {
        pixels[i + 0] = pixels[i + 0] / pixels2[i + 0];
        pixels[i + 1] = pixels[i + 1] / pixels2[i + 1];
        pixels[i + 2] = pixels[i + 2] / pixels2[i + 2];
        break;
      }
      case "multiplication": {
        pixels[i + 0] = pixels[i + 0] * pixels2[i + 0];
        pixels[i + 1] = pixels[i + 1] * pixels2[i + 1];
        pixels[i + 2] = pixels[i + 2] * pixels2[i + 2];
        break;
      }
      case "and": {
        pixels[i + 0] = pixels[i + 0] & pixels2[i + 0];
        pixels[i + 1] = pixels[i + 1] & pixels2[i + 1];
        pixels[i + 2] = pixels[i + 2] & pixels2[i + 2];
        break;
      }
      case "or": {
        pixels[i + 0] = pixels[i + 0] | pixels2[i + 0];
        pixels[i + 1] = pixels[i + 1] | pixels2[i + 1];
        pixels[i + 2] = pixels[i + 2] | pixels2[i + 2];
        break;
      }
      case "xor": {
        pixels[i + 0] = pixels[i + 0] ^ pixels2[i + 0];
        pixels[i + 1] = pixels[i + 1] ^ pixels2[i + 1];
        pixels[i + 2] = pixels[i + 2] ^ pixels2[i + 2];
        break;
      }
    }
    // Don't invert the alpha channel.
  }

  const newBytes = await encode(canvas, ctx, imageData);
  dispatchTS("openImage", {
    buffer: newBytes,
    height: imageData.height,
    width: imageData.width,
  });
});

listenTS("transformationImage", async ({ transformation: t, bytes }) => {
  let newBytes: Uint8Array;
  let newWidth: number;
  let newHeight: number;

  switch (t.type) {
    case "scale": {
      const scaleResult = await scale(bytes, t.x, t.y);
      newBytes = scaleResult.newBytes;
      newWidth = scaleResult.newWidth;
      newHeight = scaleResult.newHeight;

      break;
    }
    case "skew": {
      const skewResult = await skew(bytes, t.x, t.y);
      newBytes = skewResult.newBytes;
      newWidth = skewResult.newWidth;
      newHeight = skewResult.newHeight;

      break;
    }
    case "rotation": {
      const rotationResult = await rotation(bytes, t.angle);
      newBytes = rotationResult.newBytes;
      newWidth = rotationResult.newWidth;
      newHeight = rotationResult.newHeight;

      break;
    }
    case "reflection": {
      const reflectionResult = await reflection(
        bytes,
        t.horizontal,
        t.vertical,
      );
      newBytes = reflectionResult.newBytes;
      newWidth = reflectionResult.newWidth;
      newHeight = reflectionResult.newHeight;

      break;
    }
    case "translation": {
      const scaleResult = await translation(bytes, t.x, t.y);
      newBytes = scaleResult.newBytes;
      newWidth = scaleResult.newWidth;
      newHeight = scaleResult.newHeight;

      break;
    }
    case "zoomIn": {
      const scaleResult = await zoomIn(bytes, t.scale, t.technique);
      newBytes = scaleResult.newBytes;
      newWidth = scaleResult.newWidth;
      newHeight = scaleResult.newHeight;

      break;
    }
    case "zoomOut": {
      const scaleResult = await zoomOut(bytes, t.scale, t.technique);
      newBytes = scaleResult.newBytes;
      newWidth = scaleResult.newWidth;
      newHeight = scaleResult.newHeight;

      break;
    }
  }

  dispatchTS("openImage", {
    buffer: newBytes!,
    width: newWidth!,
    height: newHeight!,
  });
});

listenTS("decomposeImage", async ({ bytes, colorSpectrum }) => {
  let results: {
    bytes: Uint8Array;
    width: number;
    height: number;
  }[] = [];

  switch (colorSpectrum) {
    case "rgb": {
      results = await decomposeRGB(bytes);
    }
    case "cmyk": {
      results = await decomposeCMYK(bytes);
    }
    case "cmy": {
      results = await decomposeCMY(bytes);
    }
    case "yuv": {
      results = await decomposeYUV(bytes);
    }
    case "hsb": {
      results = await decomposeHSB(bytes);
    }
    case "hsl": {
      results = await decomposeHSL(bytes);
    }
  }

  for (const result of results) {
    dispatchTS("openImage", {
      buffer: result.bytes!,
      width: result.width!,
      height: result.height!,
    });
  }
});

listenTS("pseudocolorizationImage", async ({ bytes, style }) => {
  switch (style) {
    case "heatmap": {
      const {
        bytes: newBytes,
        width,
        height,
      } = await heatmapPseudocolorize(bytes);

      dispatchTS("openImage", {
        buffer: newBytes,
        width,
        height,
      });
    }
  }
});

listenTS("invertImage", async ({ bytes }) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  const imageData = await decode(canvas, ctx, bytes);
  const pixels = imageData.data;

  // Do the actual work of inverting the colors.
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i + 0] = 255 - pixels[i + 0];
    pixels[i + 1] = 255 - pixels[i + 1];
    pixels[i + 2] = 255 - pixels[i + 2];
    // Don't invert the alpha channel.
  }

  const newBytes = await encode(canvas, ctx, imageData);
  dispatchTS("openImage", {
    buffer: newBytes,
    height: imageData.height,
    width: imageData.width,
  });
});

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
      <div className="flex h-full w-full flex-col items-center gap-4 px-8 py-10">
        <h1 className="text-xl font-medium">PDI 2025</h1>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Operações</AccordionTrigger>
            <OperationsAccordionItems />
          </AccordionItem>
          <AccordionItem value="transformation">
            <AccordionTrigger>Transformações</AccordionTrigger>
            <AccordionContent className="grid grid-cols-4 gap-4">
              <Scale />
              <Skew />
              <Rotation />
              <Reflection />
              <Translation />
              <ZoomIn />
              <ZoomOut />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="color-decomposition">
            <AccordionTrigger>Decomposição de Cores</AccordionTrigger>
            <ColorDecompositionAccordionItems />
          </AccordionItem>
          <AccordionItem value="pseudocolorization">
            <AccordionTrigger>Pseudocolorização</AccordionTrigger>
            <AccordionContent>
              <Button
                onClick={() =>
                  dispatchTS("pseudocolorization", {
                    style: "heatmap",
                  })
                }
              >
                Mapa de Calor
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
        onClick={() => {
          dispatchTS("operation", {
            operation: "sum",
          });
        }}
      >
        Soma
      </Button>
      <Button
        onClick={() => {
          dispatchTS("operation", {
            operation: "subtract",
          });
        }}
      >
        Subtração
      </Button>
      <Button
        onClick={() => {
          dispatchTS("operation", {
            operation: "multiplication",
          });
        }}
      >
        Multiplicação
      </Button>
      <Button
        onClick={() => {
          dispatchTS("operation", {
            operation: "division",
          });
        }}
      >
        Divisão
      </Button>
      <Button
        onClick={() => {
          dispatchTS("operation", {
            operation: "and",
          });
        }}
      >
        AND
      </Button>
      <Button
        onClick={() => {
          dispatchTS("operation", {
            operation: "or",
          });
        }}
      >
        OR
      </Button>
      <Button
        onClick={() => {
          dispatchTS("operation", {
            operation: "xor",
          });
        }}
      >
        XOR
      </Button>
    </AccordionContent>
  );
}

function ColorDecompositionAccordionItems() {
  return (
    <AccordionContent className="grid grid-cols-4 gap-4">
      <Button
        onClick={() =>
          dispatchTS("decompose", {
            colorSpectrum: "rgb",
          })
        }
      >
        RGB
      </Button>
      <Button
        onClick={() =>
          dispatchTS("decompose", {
            colorSpectrum: "cmyk",
          })
        }
      >
        CMYK
      </Button>
      <Button
        onClick={() =>
          dispatchTS("decompose", {
            colorSpectrum: "cmy",
          })
        }
      >
        CMY
      </Button>
      <Button
        onClick={() =>
          dispatchTS("decompose", {
            colorSpectrum: "yuv",
          })
        }
      >
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
