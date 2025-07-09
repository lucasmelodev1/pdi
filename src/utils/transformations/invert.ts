import decode from "../decode";
import encode from "../encode";

export default async function invertColors(bytes: Uint8Array): Promise<{
  newBytes: Uint8Array;
  newWidth: number;
  newHeight: number;
}> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const imageData = await decode(canvas, ctx, bytes);

  const { data: pixels, width, height } = imageData;

  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = 255 - pixels[i];
    pixels[i + 1] = 255 - pixels[i + 1];
    pixels[i + 2] = 255 - pixels[i + 2];
  }

  const newBytes = await encode(canvas, ctx, imageData);
  return {
    newBytes,
    newWidth: width,
    newHeight: height,
  };
}