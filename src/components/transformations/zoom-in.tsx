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

export default function ZoomIn() {
  const [zoom, setZoom] = useState(1.0);
  const [technique, setTechnique] = useState<"replication" | "interpolation">(
    "replication",
  );

  return (
    <Dialog>
      <DialogTrigger>
        <Button className="w-full">Zoom In</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Zoom In</DialogTitle>
          <DialogDescription>
            Aplica um Zoom In utilizando replicação ou interpolação e uma escala
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
              defaultValue="interpolation"
              onValueChange={(val) => {
                if (val == "interpolation") {
                  setTechnique(val);
                } else {
                  setTechnique("replication");
                }
              }}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="interpolation" id="interpolation" />
                <Label htmlFor="interpolation">Interpolação</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="replication" id="replication" />
                <Label htmlFor="replication">Replicação</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              dispatchTS("transformation", {
                transformation: {
                  type: "zoomIn",
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
