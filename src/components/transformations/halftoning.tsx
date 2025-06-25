import { Button } from "@/components/ui/button";
import { dispatchTS } from "@/utils/utils";
import { Grid2x2, Grid3x3, Dot, ScatterChart } from "lucide-react";

const btnClass = "flex h-24 w-full flex-col items-center gap-2";

export default function HalftoningFilters() {
  return (
    <div className="grid grid-cols-4 gap-4 mb-4">
      <Button className={btnClass} onClick={() => dispatchTS("transformation", { transformation: { type: "orderedDither", matrix: "2x2" } })}>
        <Grid2x2 className="w-6 h-6" />
        Ordenado 2x2
      </Button>
      <Button className={btnClass} onClick={() => dispatchTS("transformation", { transformation: { type: "orderedDither", matrix: "2x3" } })}>
        <Grid3x3 className="w-6 h-6" />
        Ordenado 2x3
      </Button>
      <Button className={btnClass} onClick={() => dispatchTS("transformation", { transformation: { type: "orderedDither", matrix: "3x3" } })}>
        <Grid3x3 className="w-6 h-6" />
        Ordenado 3x3
      </Button>
      <Button className={btnClass} onClick={() => dispatchTS("transformation", { transformation: { type: "floydSteinbergDither" } })}>
        <ScatterChart className="w-6 h-6" />
        Floyd-Steinberg
      </Button>
    </div>
  );
} 