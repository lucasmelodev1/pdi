import { Button } from "../ui/button";
import { dispatchTS } from "@/utils/utils";
import { Radical } from "lucide-react";

export default function SqrtTransform() {
  return (
    <Button
      className="flex h-24 w-full flex-col items-center gap-2"
      onClick={() => {
        dispatchTS("transformation", {
          transformation: {
            type: "sqrt",
          },
        });
      }}
    >
      <Radical className="w-6 h-6" />
      Raiz
    </Button>
  );
}