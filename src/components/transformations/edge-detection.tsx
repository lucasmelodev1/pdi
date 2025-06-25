import { Button } from "@/components/ui/button";
import { dispatchTS } from "@/utils/utils";
import {
  Activity,
  Waves,
  SquareStack,
  SquareEqual,
  Square,
  Circle,
  Aperture,
  Zap,
  Triangle,
  Octagon,
  CircleDashed,
  AudioWaveform,
} from "lucide-react";

const btnClass = "flex h-24 w-full flex-col items-center gap-2";

export default function EdgeDetection() {
  return (
    <div className="grid grid-cols-4 gap-4 mb-4">
      <Button className={btnClass} onClick={() => dispatchTS("transformation", { transformation: { type: "robertsEdge" } })}>
        <Activity className="w-6 h-6" />
        Roberts
      </Button>
      <Button className={btnClass} onClick={() => dispatchTS("transformation", { transformation: { type: "robertsCrossEdge" } })}>
        <Activity className="w-6 h-6" />
        Roberts Cruzado
      </Button>
      <Button className={btnClass} onClick={() => dispatchTS("transformation", { transformation: { type: "prewittGx" } })}>
        <AudioWaveform className="w-6 h-6" />
        Prewitt Gx
      </Button>
      <Button className={btnClass} onClick={() => dispatchTS("transformation", { transformation: { type: "prewittGy" } })}>
        <AudioWaveform className="w-6 h-6" />
        Prewitt Gy
      </Button>
      <Button className={btnClass} onClick={() => dispatchTS("transformation", { transformation: { type: "prewittMagnitude" } })}>
        <Waves className="w-6 h-6" />
        Prewitt Magnitude
      </Button>
      <Button className={btnClass} onClick={() => dispatchTS("transformation", { transformation: { type: "sobelGx" } })}>
        <SquareStack className="w-6 h-6" />
        Sobel Gx
      </Button>
      <Button className={btnClass} onClick={() => dispatchTS("transformation", { transformation: { type: "sobelGy" } })}>
        <SquareStack className="w-6 h-6" />
        Sobel Gy
      </Button>
      <Button className={btnClass} onClick={() => dispatchTS("transformation", { transformation: { type: "sobelMagnitude" } })}>
        <SquareStack className="w-6 h-6" />
        Sobel Magnitude
      </Button>
      <Button className={btnClass} onClick={() => dispatchTS("transformation", { transformation: { type: "kirschEdge" } })}>
        <Zap className="w-6 h-6" />
        Kirsch
      </Button>
      <Button className={btnClass} onClick={() => dispatchTS("transformation", { transformation: { type: "robinsonEdge" } })}>
        <Triangle className="w-6 h-6" />
        Robinson
      </Button>
      <Button className={btnClass} onClick={() => dispatchTS("transformation", { transformation: { type: "freyChenEdge" } })}>
        <Aperture className="w-6 h-6" />
        Frey-Chen
      </Button>
      <Button className={btnClass} onClick={() => dispatchTS("transformation", { transformation: { type: "laplacianH1" } })}>
        <Octagon className="w-6 h-6" />
        Laplaciano H1
      </Button>
      <Button className={btnClass} onClick={() => dispatchTS("transformation", { transformation: { type: "laplacianH2" } })}>
        <CircleDashed className="w-6 h-6" />
        Laplaciano H2
      </Button>
    </div>
  );
} 