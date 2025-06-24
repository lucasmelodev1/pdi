import { Button } from "../ui/button";
import { dispatchTS } from "@/utils/utils";

export default function LogTransform() {
  return (
    <Button
      className="flex h-24 w-full flex-col items-center gap-2"
      onClick={() => {
        dispatchTS("transformation", {
          transformation: {
            type: "log",
          },
        });
      }}
    >
      Log
    </Button>
  );
}