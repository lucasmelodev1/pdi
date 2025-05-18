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
  operation: {
    operation: "sum" | "subtract" | "multiplication" | "division";
  };
  operationImage: {
    operation: "sum" | "subtract" | "multiplication" | "division";
    bytes: Uint8Array;
    bytes2: Uint8Array;
  };
  invert: {};
  invertImage: {
    bytes: Uint8Array;
  };
}
