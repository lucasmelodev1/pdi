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
    }
  | {
      type: "zoomIn";
      scale: number;
      technique: "interpolation" | "replication";
    }
  | {
      type: "zoomOut";
      scale: number;
      technique: "exclusion" | "average";
    } | {
      type: "gammaCorrection";
      gamma: number;
    } | {
      type: "histogramEqualization";
    } | {
      type: "bitSlicing";
    } | {
      type: "invert";
    } | {
      type: "log";
    } | {
      type: "sqrt";
    } | {
      type: "exp";
    } | {
      type: "square";
    } | {
      type: "mean";
      kernelSize: 3 | 5;
    } | {
      type: "median";
      kernelSize: 3 | 5;
    } | {
      type: "max";
    } | {
      type: "min";
    } | {
      type: "mode";
    } | {
      type: "kawahara";
    } | {
      type: "tomitaTsuji";
    } | {
      type: "nagaoMatsuyama";
    } | {
      type: "somboonkaew";
    } | { type: "highPass"; filterType: "h1" | "h2" | "m1" | "m2" | "m3" }
  | { type: "highPassBoost"; boostFactor?: number }

type ColorSpectrum = "rgb" | "cmyk" | "cmy" | "hsb" | "hsl" | "yuv";

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
  decompose: {
    colorSpectrum: ColorSpectrum;
  };
  decomposeImage: {
    bytes: Uint8Array;
    colorSpectrum: ColorSpectrum;
  };
  pseudocolorization: {
    style: "heatmap" | "falseColor";
  };
  pseudocolorizationImage: {
    style: "heatmap" | "falseColor";
    bytes: Uint8Array;
  };
  invert: {};
  invertImage: {
    bytes: Uint8Array;
  };
}
