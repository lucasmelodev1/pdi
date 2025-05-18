export function setGray(dest: Uint8ClampedArray, index: number, value: number) {
  const v = Math.round(value);
  dest[index + 0] = v;
  dest[index + 1] = v;
  dest[index + 2] = v;
  dest[index + 3] = 255;
}
