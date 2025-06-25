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
import { Dot } from "lucide-react";

const btnClass = "flex h-24 w-full flex-col items-center gap-2";

export default function PointDetection() {
  const [T, setT] = useState(30);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={btnClass}>
          <Dot className="w-6 h-6" />
          Detecção de Pontos
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detecção de Pontos</DialogTitle>
          <DialogDescription>
            Detecta pontos na imagem usando uma máscara Laplaciana. Informe o threshold T.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 w-full py-4">
          <Input
            type="number"
            min={0}
            max={255}
            value={T}
            onChange={e => setT(Number(e.target.value))}
            className="w-20"
          />
          <span className="text-xs text-gray-600">T (threshold)</span>
        </div>
        <DialogFooter>
          <Button onClick={() => dispatchTS("transformation", { transformation: { type: "pointDetection", T } })}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 