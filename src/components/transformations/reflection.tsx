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
import { Switch } from "../ui/switch";

export default function Reflection() {
  const [x, setX] = useState(false);
  const [y, setY] = useState(false);

  return (
    <Dialog>
      <DialogTrigger>
        <Button className="w-full">Reflexão</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reflexão</DialogTitle>
          <DialogDescription>
            Reflete a imagem no eixo X e/ou no eixo Y
          </DialogDescription>
        </DialogHeader>
        <div className="grid h-full grid-cols-2 gap-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="email">Eixo X</Label>
            <Switch checked={x} onCheckedChange={setX} />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="email">Eixo Y</Label>
            <Switch checked={y} onCheckedChange={setY} />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              dispatchTS("transformation", {
                transformation: {
                  type: "reflection",
                  horizontal: x,
                  vertical: y,
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
