import { Button } from "../ui/button";
import { dispatchTS } from "@/utils/utils";
import { Repeat } from "lucide-react";

export default function ModeFilter() {
  return (
    <Button
      className="flex h-24 w-full flex-col items-center gap-2"
      onClick={() => {
        dispatchTS("transformation", {
          transformation: {
            type: "mode",
          },
        });
      }}
    >
      <Repeat />
      Filtro de Moda
    </Button>
  );
}