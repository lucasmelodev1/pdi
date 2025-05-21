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
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { ShrinkIcon, ZoomOutIcon } from "lucide-react";

export default function ZoomOut() {
  const [zoom, setZoom] = useState(1.0);
  const [technique, setTechnique] = useState<"exclusion" | "average">(
    "exclusion",
  );

  return (
    <Dialog>
      <DialogTrigger>
        <Button className="flex h-24 w-full flex-col items-center gap-2">
          <ZoomOutIcon />
          Zoom Out
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Zoom Out</DialogTitle>
          <DialogDescription>
            Aplica um Zoom Out utilizando exclusão ou valor da média e uma
            escala
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="email">Zoom</Label>
            <Input
              type="number"
              value={zoom}
              max={10}
              min={1}
              onChange={(e) => setZoom(Number(e.target.value))}
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label>Técnica</Label>
            <RadioGroup
              defaultValue="average"
              onValueChange={(val) => {
                if (val == "average") {
                  setTechnique(val);
                } else {
                  setTechnique("exclusion");
                }
              }}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="average" id="average" />
                <Label htmlFor="average">Valor da Média</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="exclusion" id="exclusion" />
                <Label htmlFor="exclusion">Exclusão</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              dispatchTS("transformation", {
                transformation: {
                  type: "zoomOut",
                  scale: zoom,
                  technique,
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
