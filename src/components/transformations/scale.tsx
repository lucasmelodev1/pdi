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
import imgSrc from "./img/Escala.svg";
import { ScalingIcon } from "lucide-react";

export default function Scale() {
  const [x, setX] = useState(1.0);
  const [y, setY] = useState(1.0);

  return (
    <Dialog>
      <DialogTrigger>
        <Button className="flex h-24 w-full flex-col items-center gap-2">
          <ScalingIcon />
          Escala
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Escala</DialogTitle>
          <DialogDescription>
            Escala a imagem utilizando Nearest-neighbor para os valores
            indicados de X e Y
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="email">X</Label>
            <Input
              type="number"
              value={x}
              max={10}
              onChange={(e) => setX(Number(e.target.value))}
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="email">Y</Label>
            <Input
              type="number"
              value={y}
              max={10}
              onChange={(e) => setY(Number(e.target.value))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              dispatchTS("transformation", {
                transformation: {
                  type: "scale",
                  x,
                  y,
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
