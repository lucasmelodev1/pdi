import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dispatchTS } from "@/utils/utils";
import { LineChart } from "lucide-react";

const btnClass = "flex h-24 w-full flex-col items-center gap-2";

export default function LineDetection() {
  const [openLine, setOpenLine] = useState<null | 'horizontal' | 'vertical' | '45' | '135'>(null);
  const [TLine, setTLine] = useState(30);

  return (
    <Dialog open={!!openLine} onOpenChange={v => !v && setOpenLine(null)}>
      <DialogTrigger asChild>
        <Button className={btnClass} onClick={() => setOpenLine('horizontal')}>
          <LineChart className="w-6 h-6" />
          Detecção de Retas
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detecção de Retas</DialogTitle>
          <DialogDescription>
            Detecta retas horizontais, verticais, 45° ou 135° usando convolução. Escolha a direção e threshold T.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button variant={openLine === 'horizontal' ? 'default' : 'outline'} onClick={() => setOpenLine('horizontal')}>Horizontal</Button>
          <Button variant={openLine === 'vertical' ? 'default' : 'outline'} onClick={() => setOpenLine('vertical')}>Vertical</Button>
          <Button variant={openLine === '45' ? 'default' : 'outline'} onClick={() => setOpenLine('45')}>45 graus</Button>
          <Button variant={openLine === '135' ? 'default' : 'outline'} onClick={() => setOpenLine('135')}>135 graus</Button>
        </div>
        <div className="flex items-center gap-2 w-full py-4">
          <Input
            type="number"
            min={0}
            max={255}
            value={TLine}
            onChange={e => setTLine(Number(e.target.value))}
            className="w-20"
          />
          <span className="text-xs text-gray-600">T (threshold)</span>
        </div>
        <DialogFooter>
          <Button
            disabled={!openLine}
            onClick={() => {
              if (openLine) {
                dispatchTS("transformation", { transformation: { type: "lineDetection", direction: openLine, T: TLine } });
                setOpenLine(null);
              }
            }}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
 