import { Button } from "../ui/button";
import { dispatchTS } from "@/utils/utils";
import { Compass } from "lucide-react";

export default function SomboonkaewFilter() {
  return (
    <Button
      className="flex h-24 w-full flex-col items-center gap-2 text-center"
      onClick={() => {
        dispatchTS("transformation", {
          transformation: {
            type: "somboonkaew",
          },
        });
      }}
    >
      <Compass />
      Somboonkaew
    </Button>
  );
}