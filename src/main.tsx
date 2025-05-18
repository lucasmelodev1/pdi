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
