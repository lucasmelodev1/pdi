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

listenTS("sumImage", async ({ bytes, bytes2 }) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  const imageData = await decode(canvas, ctx, bytes);
  const imageData2 = await decode(canvas, ctx, bytes2);
  const pixels = imageData.data;
  const pixels2 = imageData2.data;

  // Do the actual work of inverting the colors.
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i + 0] = pixels[i + 0] + pixels2[i + 0];
    pixels[i + 1] = pixels[i + 1] + pixels2[i + 1];
    pixels[i + 2] = pixels[i + 2] + pixels2[i + 2];
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
      <div className="flex h-full w-full flex-col items-center gap-4 py-10">
        <h1 className="text-xl font-medium">Select Naruto Character</h1>
        <Button
          onClick={() => {
            dispatchTS("sum", {});
          }}
        >
          Soma
        </Button>
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
        <div className="flex flex-row gap-4">
          <Button onClick={onClickCreate} size={"sm"}>
            Create
          </Button>
          <Button variant={"destructive"} size={"sm"} onClick={onClickClose}>
            Close
          </Button>
        </div>
      </div>
    </>
  );
};
