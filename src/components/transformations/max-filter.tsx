import { Button } from "../ui/button";
import { dispatchTS } from "@/utils/utils";
import { ArrowUp } from "lucide-react";

export default function MaxFilter() {
  return (
    <Button
      className="flex h-24 w-full flex-col items-center gap-2"
      onClick={() => {
        dispatchTS("transformation", {
          transformation: {
            type: "max",
          },
        });
      }}
    >
      <ArrowUp />
      Filtro de Máximo
    </Button>
  );
}