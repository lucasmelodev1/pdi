export function parsePGM(buffer: Uint8Array): {
  width: number;
  height: number;
  pixels: Uint8ClampedArray;
} {
  const text = new TextDecoder("ascii").decode(buffer);
  const lines = text
    .split(/[\r\n]+/)
    .filter((line) => line.trim() && !line.startsWith("#"));

  if (lines[0] !== "P2") throw new Error("Invalid PGM: must start with P2");

  const [width, height] = lines[1].split(/\s+/).map(Number);
  const maxVal = parseInt(lines[2]);
  const pixelValues = lines.slice(3).join(" ").trim().split(/\s+/).map(Number);

  console.log(pixelValues.length);
  console.log(height);
  console.log(width);
  // if (pixelValues.length !== width * height)
  //   throw new Error("Invalid PGM: pixel count mismatch");

  const rgba = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < pixelValues.length; i++) {
    const v = Math.round((pixelValues[i] / maxVal) * 255);
    rgba.set([v, v, v, 255], i * 4);
  }

  return { width, height, pixels: rgba };
}
