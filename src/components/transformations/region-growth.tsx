import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { dispatchTS } from "@/utils/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { SplitIcon } from "lucide-react";

export default function RegionGrowing() {
  const [open, setOpen] = useState(false);
  const [seedX, setSeedX] = useState<number>(0);
  const [seedY, setSeedY] = useState<number>(0);
  const [threshold, setThreshold] = useState<number>(30);

  const handleApply = () => {
    dispatchTS("transformation", {
      transformation: {
        type: "regionGrowing",
        seedX,
        seedY,
        threshold,
      },
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex h-24 w-full flex-col items-center gap-2">
          <SplitIcon className="h-5 w-5" />
          <span className="whitespace-normal">Crescimento de Região</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crescimento de Região</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="seedX">Posição X da Semente</Label>
            <Input
              type="number"
              id="seedX"
              value={seedX}
              onChange={(e) => setSeedX(parseInt(e.target.value))}
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="seedY">Posição Y da Semente</Label>
            <Input
              type="number"
              id="seedY"
              value={seedY}
              onChange={(e) => setSeedY(parseInt(e.target.value))}
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="threshold">
              Limiar de Similaridade
              <span className="ml-1 text-sm text-muted-foreground">
                (0-255)
              </span>
            </Label>
            <Input
              type="number"
              id="threshold"
              min="0"
              max="255"
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value))}
            />
          </div>
          <Button onClick={handleApply} className="w-full">
            Aplicar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}