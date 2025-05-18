import svgMapping from "./lib/svg-mapping";
import { dispatch, dispatchTS, listenTS } from "./utils/code-utils";
import decode from "../src/utils/decode";
import encode from "../src/utils/encode";

figma.showUI(__html__, {
  width: 720,
  height: 480,
});

listenTS("createSvg", (res) => {
  const svg = svgMapping[res.svg];

  const node = figma.createNodeFromSvg(svg);
  figma.currentPage.appendChild(node);

  figma.currentPage.selection = [node];
  figma.viewport.scrollAndZoomIntoView([node]);

  figma.notify("SVG component created successfully!");

  figma.closePlugin();
});

listenTS("closePlugin", () => {
  figma.closePlugin();
});

listenTS("openImage", (msg) => {
  const pngBytes = new Uint8Array(msg.buffer);
  const image = figma.createImage(pngBytes);
  const node = figma.createRectangle();
  node.resize(msg.width, msg.height);
  node.fills = [{ type: "IMAGE", imageHash: image.hash, scaleMode: "FILL" }];
  figma.currentPage.appendChild(node);
});

listenTS("sum", async (msg) => {
  const node = figma.currentPage.selection[0] as GeometryMixin;
  const node2 = figma.currentPage.selection[1] as GeometryMixin;
  for (let i = 0; i < (node.fills as Paint[]).length; i++) {
    const paint = node.fills[i];
    const paint2 = node2.fills[i];
    if (paint.type === "IMAGE" && paint2.type === "IMAGE") {
      const image = figma.getImageByHash(paint.imageHash);
      const image2 = figma.getImageByHash(paint2.imageHash);
      const bytes = await image.getBytesAsync();
      const bytes2 = await image2.getBytesAsync();

      dispatchTS("sumImage", {
        bytes,
        bytes2,
      });
    }
  }
});

listenTS("invert", async (msg) => {
  const node = figma.currentPage.selection[0] as GeometryMixin;
  for (const paint of node.fills as Paint[]) {
    if (paint.type === "IMAGE") {
      const image = figma.getImageByHash(paint.imageHash);
      const bytes = await image.getBytesAsync();

      dispatchTS("invertImage", {
        bytes,
      });
    }
  }
});
