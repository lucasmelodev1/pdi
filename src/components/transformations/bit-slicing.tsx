import { Button } from "../ui/button";
import { dispatchTS } from "@/utils/utils";
import { BinaryIcon } from "lucide-react"; // Um ícone adequado para bits

export default function BitSlicing() {
  return (
    <Button
      className="flex h-24 w-full flex-col items-center gap-2"
      onClick={() => {
        dispatchTS("transformation", {
          transformation: {
            type: "bitSlicing",
          },
        });
      }}
    >
      <BinaryIcon />
      Fatiamento de Bits
    </Button>
  );
}