import decode from "../decode";
import encode from "../encode";

type NonLinearType = "log" | "sqrt" | "exp" | "square";

export default async function applyNonLinear(
  bytes: Uint8Array,
  type: NonLinearType
): Promise<{
  newBytes: Uint8Array;
  newWidth: number;
  newHeight: number;
}> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const imageData = await decode(canvas, ctx, bytes);
  const { data: pixels, width, height } = imageData;

  const lut = new Uint8Array(256);
  let c = 1;

  switch (type) {
    case "log":
      c = 255 / Math.log(1 + 255);
      for (let i = 0; i < 256; i++) {
        lut[i] = c * Math.log(1 + i);
      }
      break;
    case "sqrt":
      c = 255 / Math.sqrt(255);
      for (let i = 0; i < 256; i++) {
        lut[i] = c * Math.sqrt(i);
      }
      break;
    case "exp":
      c = 255 / (Math.exp(1) - 1);
      for (let i = 0; i < 256; i++) {
        lut[i] = c * (Math.exp(i / 255) - 1);
      }
      break;
    case "square":
      c = 255 / (255 * 255);
      for (let i = 0; i < 256; i++) {
        lut[i] = c * i * i;
      }
      break;
  }

  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = lut[pixels[i]];
    pixels[i + 1] = lut[pixels[i + 1]];
    pixels[i + 2] = lut[pixels[i + 2]];
  }

  const newBytes = await encode(canvas, ctx, imageData);
  return {
    newBytes,
    newWidth: width,
    newHeight: height
  };
}