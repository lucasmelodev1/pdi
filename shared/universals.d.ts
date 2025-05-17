export interface EventTS {
  createSvg: {
    svg: string;
  };
  closePlugin: {};
  openImage: {
    width: number;
    height: number;
    buffer: ArrayBuffer;
  };
}
