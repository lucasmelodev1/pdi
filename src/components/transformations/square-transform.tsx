import { Button } from "../ui/button";
import { dispatchTS } from "@/utils/utils";
import { Superscript } from "lucide-react";

export default function SquareTransform() {
  return (
    <Button
      className="flex h-24 w-full flex-col items-center gap-2"
      onClick={() => {
        dispatchTS("transformation", {
          transformation: {
            type: "square",
          },
        });
      }}
    >
      <Superscript className="w-6 h-6" />
      Potência
    </Button>
  );
}