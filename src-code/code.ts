import svgMapping from "./lib/svg-mapping";
import { listenTS } from "./utils/code-utils";

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
