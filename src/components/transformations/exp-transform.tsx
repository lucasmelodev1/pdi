import { Button } from "../ui/button";
import { dispatchTS } from "@/utils/utils";

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
      Exp
    </Button>
  );
}