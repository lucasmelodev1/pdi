type Operation =
  | "sum"
  | "subtract"
  | "multiplication"
  | "division"
  | "and"
  | "or"
  | "xor";

type Transformation =
  | {
      type: "scale";
      x: number;
      y: number;
    }
  | {
      type: "translation";
      x: number;
      y: number;
    }
  | {
      type: "skew";
      x: number;
      y: number;
    }
  | {
      type: "rotation";
      angle: number;
    }
  | {
      type: "reflection";
      horizontal: boolean;
      vertical: boolean;
    };

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
    operation: Operation;
  };
  operationImage: {
    operation: Operation;
    bytes: Uint8Array;
    bytes2: Uint8Array;
  };
  transformation: {
    transformation: Transformation;
  };
  transformationImage: {
    transformation: Transformation;
    bytes: Uint8Array;
  };
  invert: {};
  invertImage: {
    bytes: Uint8Array;
  };
}
