import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { DropletIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { dispatchTS } from "@/utils/utils";

export default function Watershed() {
  const [open, setOpen] = useState(false);
  const [threshold, setThreshold] = useState<number>(30);

  const handleApply = () => {
    dispatchTS("transformation", {
      transformation: {
        type: "watershed",
        threshold,
        highlightBoundaries: true // Para destacar as linhas de contenção
      },
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex h-24 w-full flex-col items-center gap-2">
          <DropletIcon className="h-5 w-5" />
          <span className="whitespace-normal">Watershed</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Segmentação Watershed</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="threshold">
              Limiar de Gradiente
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