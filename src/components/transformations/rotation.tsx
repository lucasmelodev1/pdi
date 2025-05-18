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

export default function Rotation() {
  const [angle, setAngle] = useState(1.0);

  return (
    <Dialog>
      <DialogTrigger>
        <Button className="w-full">Rotação</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rotação</DialogTitle>
          <DialogDescription>
            Rotaciona a imagem de acordo com o grau escolhido
          </DialogDescription>
        </DialogHeader>
        <div className="mx-auto">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="email">X</Label>
            <Input
              type="number"
              value={angle}
              max={360}
              min={-360}
              onChange={(e) => setAngle(Number(e.target.value))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              dispatchTS("transformation", {
                transformation: {
                  type: "rotation",
                  angle,
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
