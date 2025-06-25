import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { dispatchTS } from "@/utils/utils";
import { SlidersHorizontal, Waves, ArrowUp, ArrowDown, Sigma } from "lucide-react";

const btnClass = "flex h-24 w-full flex-col items-center gap-2";

export default function Thresholding() {
  const [open, setOpen] = useState<null | "global" | "mean" | "max" | "min" | "niblack">(null);
  const [threshold, setThreshold] = useState(128);
  const [windowSize, setWindowSize] = useState(3);
  const [k, setK] = useState(-0.2);

  return (
    <div className="grid grid-cols-5 gap-3 mb-4">
      <Button className={btnClass} onClick={() => setOpen("global")}> <SlidersHorizontal className="w-6 h-6" /> Global</Button>
      <Button className={btnClass} onClick={() => setOpen("mean")}> <Waves className="w-6 h-6" /> Local Média</Button>
      <Button className={btnClass} onClick={() => setOpen("max")}> <ArrowUp className="w-6 h-6" /> Local Máximo</Button>
      <Button className={btnClass} onClick={() => setOpen("min")}> <ArrowDown className="w-6 h-6" /> Local Mínimo</Button>
      <Button className={btnClass} onClick={() => setOpen("niblack")}> <Sigma className="w-6 h-6" /> Niblack</Button>

      {/* Global Threshold Dialog */}
      <Dialog open={open === "global"} onOpenChange={() => setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Limiarização Global</DialogTitle>
          </DialogHeader>
          <label className="text-sm mb-1">Limiar</label>
          <Input type="number" min={0} max={255} value={threshold} onChange={e => setThreshold(Number(e.target.value))} />
          <DialogFooter>
            <Button onClick={() => {
              dispatchTS("transformation", { transformation: { type: "globalThreshold", threshold } });
              setOpen(null);
            }}>Aplicar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Local Mean Dialog */}
      <Dialog open={open === "mean"} onOpenChange={() => setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Limiarização Local (Média)</DialogTitle>
          </DialogHeader>
          <label className="text-sm mb-1">Tamanho da Janela</label>
          <Input type="number" min={3} step={2} value={windowSize} onChange={e => setWindowSize(Number(e.target.value))} />
          <DialogFooter>
            <Button onClick={() => {
              dispatchTS("transformation", { transformation: { type: "localMeanThreshold", windowSize } });
              setOpen(null);
            }}>Aplicar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Local Max Dialog */}
      <Dialog open={open === "max"} onOpenChange={() => setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Limiarização Local (Máximo)</DialogTitle>
          </DialogHeader>
          <label className="text-sm mb-1">Tamanho da Janela</label>
          <Input type="number" min={3} step={2} value={windowSize} onChange={e => setWindowSize(Number(e.target.value))} />
          <DialogFooter>
            <Button onClick={() => {
              dispatchTS("transformation", { transformation: { type: "localMaxThreshold", windowSize, normalize: true } });
              setOpen(null);
            }}>Aplicar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Local Min Dialog */}
      <Dialog open={open === "min"} onOpenChange={() => setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Limiarização Local (Mínimo)</DialogTitle>
          </DialogHeader>
          <label className="text-sm mb-1">Tamanho da Janela</label>
          <Input type="number" min={3} step={2} value={windowSize} onChange={e => setWindowSize(Number(e.target.value))} />
          <DialogFooter>
            <Button onClick={() => {
              dispatchTS("transformation", { transformation: { type: "localMinThreshold", windowSize, normalize: true } });
              setOpen(null);
            }}>Aplicar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Niblack Dialog */}
      <Dialog open={open === "niblack"} onOpenChange={() => setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Limiarização Niblack</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <label className="text-sm mb-1">Tamanho da Janela</label>
            <Input type="number" min={3} step={2} value={windowSize} onChange={e => setWindowSize(Number(e.target.value))} />
            <label className="text-sm mb-1">k</label>
            <Input type="number" step={0.01} value={k} onChange={e => setK(Number(e.target.value))} />
          </div>
          <DialogFooter>
            <Button onClick={() => {
              dispatchTS("transformation", { transformation: { type: "niblackThreshold", windowSize, k } });
              setOpen(null);
            }}>Aplicar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 