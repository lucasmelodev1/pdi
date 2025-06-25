import { Button } from "@/components/ui/button";
import { dispatchTS } from "@/utils/utils";

const btnClass = "flex h-24 w-full flex-col items-center gap-2";

const HighPassFilters = () => {
  return (
    <div className="grid grid-cols-4 gap-4 mb-4">
      <Button className={btnClass} onClick={() => dispatchTS("transformation", { transformation: { type: "highPass", filterType: "h1" } })}>H1</Button>
      <Button className={btnClass} onClick={() => dispatchTS("transformation", { transformation: { type: "highPass", filterType: "h2" } })}>H2</Button>
      <Button className={btnClass} onClick={() => dispatchTS("transformation", { transformation: { type: "highPass", filterType: "m1" } })}>M1</Button>
      <Button className={btnClass} onClick={() => dispatchTS("transformation", { transformation: { type: "highPass", filterType: "m2" } })}>M2</Button>
      <Button className={btnClass} onClick={() => dispatchTS("transformation", { transformation: { type: "highPass", filterType: "m3" } })}>M3</Button>
      <Button className={btnClass} onClick={() => dispatchTS("transformation", { transformation: { type: "highPassBoost", boostFactor: 1.5 } })}>High-Boost</Button>
    </div>
  );
};

export default HighPassFilters; 