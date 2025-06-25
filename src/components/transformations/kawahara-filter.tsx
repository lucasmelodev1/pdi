// src/components/transformations/kawahara-filter.tsx
import { Button } from "../ui/button";
import { dispatchTS } from "@/utils/utils";
import { Spline } from "lucide-react";

export default function KawaharaFilter() {
  return (
    <Button
      className="flex h-24 w-full flex-col items-center gap-2"
      onClick={() => {
        dispatchTS("transformation", {
          transformation: {
            type: "kawahara",
          },
        });
      }}
    >
      <Spline />
      Kawahara
    </Button>
  );
}