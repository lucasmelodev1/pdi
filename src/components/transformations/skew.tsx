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
import imgSrc from "./img/Cisalhamento.png";
import { SquareIcon } from "lucide-react";

export default function Skew() {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  return (
    <Dialog>
      <DialogTrigger>
        <Button className="flex h-24 w-full flex-col items-center gap-2">
          {/* <img src={imgSrc} alt="Escala" className="" /> */}
          <SquareIcon style={{ transform: `skew(20deg, 0)` }} />
          Cisalhamento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cisalhamento</DialogTitle>
          <DialogDescription>
            Faz o cisalhamento da imagem na horizontal ou vertical com os
            valores indicados
          </DialogDescription>
        </DialogHeader>
        <div className="grid h-full grid-cols-[1fr_20px_1fr] gap-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="email">Horizontal</Label>
            <Input
              type="number"
              value={x}
              max={10}
              onChange={(e) => {
                setX(Number(e.target.value));
                setY(0);
              }}
            />
          </div>
          <div className="flex h-full w-full items-center justify-center">
            <p className="mt-4 text-sm">OU</p>
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="email">Vertical</Label>
            <Input
              type="number"
              value={y}
              max={10}
              onChange={(e) => {
                setY(Number(e.target.value));
                setX(0);
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              dispatchTS("transformation", {
                transformation: {
                  type: "skew",
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
