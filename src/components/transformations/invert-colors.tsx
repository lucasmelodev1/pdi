import { Button } from "../ui/button";
import { dispatchTS } from "@/utils/utils";
import { Palette } from "lucide-react";

export default function InvertColors() {
  return (
    <Button
      className="flex h-24 w-full flex-col items-center gap-2"
      onClick={() => {
        dispatchTS("transformation", {
          transformation: {
            type: "invert",
          },
        });
      }}
    >
      <Palette />
      Inverter Cores
    </Button>
  );
}