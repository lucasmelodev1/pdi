import { Button } from "../ui/button";
import { dispatchTS } from "@/utils/utils";
import { ContrastIcon } from "lucide-react";

export default function HistogramEqualization() {
  return (
    <Button
      className="flex h-24 w-full flex-col items-center gap-2"
      onClick={() => {
        dispatchTS("transformation", {
          transformation: {
            type: "histogramEqualization",
          },
        });
      }}
    >
      <ContrastIcon />
      Equalização de Histograma
    </Button>
  );
}