import decode from "./decode";
import encode from "./encode";
import { dispatchTS, listenTS } from "./utils";

listenTS("invertImage", async ({ bytes }) => {
  console.log("frontend ouvindo");
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  const imageData = await decode(canvas, ctx, bytes);
  const pixels = imageData.data;

  // Do the actual work of inverting the colors.
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i + 0] = 255 - pixels[i + 0];
    pixels[i + 1] = 255 - pixels[i + 1];
    pixels[i + 2] = 255 - pixels[i + 2];
    // Don't invert the alpha channel.
  }

  const newBytes = await encode(canvas, ctx, imageData);
  dispatchTS("openImage", {
    buffer: newBytes,
    height: imageData.height,
    width: imageData.width,
  });
});
