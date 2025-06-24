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
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { dispatchTS } from "@/utils/utils";
import { Waves } from "lucide-react";

export default function MeanFilter() {
  const [kernelSize, setKernelSize] = useState<"3" | "5">("3");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex h-24 w-full flex-col items-center gap-2">
          <Waves />
          Filtro de Média
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filtro de Média</DialogTitle>
          <DialogDescription>
            Suaviza a imagem calculando a média dos pixels vizinhos. Escolha o
            tamanho do kernel.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <RadioGroup
            defaultValue="3"
            value={kernelSize}
            onValueChange={(v) => setKernelSize(v as "3" | "5")}
          >
            <Label>Tamanho do Kernel</Label>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3" id="k3" />
              <Label htmlFor="k3">3x3</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="5" id="k5" />
              <Label htmlFor="k5">5x5</Label>
            </div>
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              dispatchTS("transformation", {
                transformation: {
                  type: "mean",
                  kernelSize: Number(kernelSize) as 3 | 5,
                },
              });
            }}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}