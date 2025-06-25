import { Button } from "../ui/button";
import { dispatchTS } from "@/utils/utils";
import { Superscript } from "lucide-react";

export default function ExpTransform() {
  return (
    <Button
      className="flex h-24 w-full flex-col items-center gap-2"
      onClick={() => {
        dispatchTS("transformation", {
          transformation: {
            type: "exp",
          },
        });
      }}
    >
      <Superscript className="w-6 h-6" />
      Exp
    </Button>
  );
}