import { Button } from "../ui/button";
import { dispatchTS } from "@/utils/utils";
import { CircleDot } from "lucide-react"; // Um ícone que remeta a pontos ou regiões

export default function TomitaTsujiFilter() {
  return (
    <Button
      className="flex h-24 w-full flex-col items-center gap-2"
      onClick={() => {
        dispatchTS("transformation", {
          transformation: {
            type: "tomitaTsuji",
          },
        });
      }}
    >
      <CircleDot />
      Tomita & Tsuji
    </Button>
  );
}