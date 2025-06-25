import { Button } from "../ui/button";
import { dispatchTS } from "@/utils/utils";
import { Logs } from "lucide-react";

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
      <Logs className="w-6 h-6" />
      Log
    </Button>
  );
}