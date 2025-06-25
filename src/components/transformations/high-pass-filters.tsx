import { Button } from "@/components/ui/button";
import { dispatchTS } from "@/utils/utils";
import { Filter } from "lucide-react";

const btnClass = "flex h-24 w-full flex-col items-center gap-2";

const HighPassFilters = () => {
  return (
    <div className="grid grid-cols-4 gap-4 mb-4">
      <Button className={btnClass} onClick={() => dispatchTS("transformation", { transformation: { type: "highPass", filterType: "h1" } })}>
        <Filter className="w-6 h-6" />
        H1
      </Button>
      <Button className={btnClass} onClick={() => dispatchTS("transformation", { transformation: { type: "highPass", filterType: "h2" } })}>
        <Filter className="w-6 h-6" />
        H2
      </Button>
      <Button className={btnClass} onClick={() => dispatchTS("transformation", { transformation: { type: "highPass", filterType: "m1" } })}>
        <Filter className="w-6 h-6" />
        M1
      </Button>
      <Button className={btnClass} onClick={() => dispatchTS("transformation", { transformation: { type: "highPass", filterType: "m2" } })}>
        <Filter className="w-6 h-6" />
        M2
      </Button>
      <Button className={btnClass} onClick={() => dispatchTS("transformation", { transformation: { type: "highPass", filterType: "m3" } })}>
        <Filter className="w-6 h-6" />
        M3
      </Button>
      <Button className={btnClass} onClick={() => dispatchTS("transformation", { transformation: { type: "highPassBoost", boostFactor: 1.5 } })}>
        <Filter className="w-6 h-6" />
        High-Boost
      </Button>
    </div>
  );
};

export default HighPassFilters; 