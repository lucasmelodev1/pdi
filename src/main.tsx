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
import { dispatchTS } from "./utils/utils";
import svgs from "./lib/svgs";
import { Input } from "./components/ui/input";
import { parsePGM } from "./utils/pgm";

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
