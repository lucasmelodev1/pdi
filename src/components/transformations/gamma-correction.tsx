// src/components/transformations/gammaCorrection.tsx
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
import { Input } from "../ui/input";
import { dispatchTS } from "@/utils/utils";
import { SunIcon } from "lucide-react";

export default function GammaCorrection() {
  const [gamma, setGamma] = useState(1.0);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex h-24 w-full flex-col items-center gap-2">
          <SunIcon />
          Brilho (Gama)
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Correção de Gama</DialogTitle>
          <DialogDescription>
            Ajuste o brilho da imagem alterando o valor de gama. Valores
            menores que 1.0 clareiam a imagem, e valores maiores que 1.0
            escurecem.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="gamma">Gama</Label>
            <Input
              id="gamma"
              type="number"
              value={gamma}
              step={0.1}
              min={0.1}
              max={5.0}
              onChange={(e) => setGamma(Number(e.target.value))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              dispatchTS("transformation", {
                transformation: {
                  type: "gammaCorrection",
                  gamma,
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