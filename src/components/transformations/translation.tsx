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
import { MoveIcon } from "lucide-react";

export default function Translation() {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  return (
    <Dialog>
      <DialogTrigger>
        <Button className="flex h-24 w-full flex-col items-center gap-2">
          <MoveIcon />
          Translação
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Translação</DialogTitle>
          <DialogDescription>
            Translada a imagem no eixo X e/ou no eixo Y baseado nos valores
            passados
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
                  type: "translation",
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
