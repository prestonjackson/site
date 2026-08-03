// @ts-check
"use strict";

import { Color } from "../../math/color.js";

// A stage that clears the color and depth buffers at the start of a render
// pass.
export class ClearStage {
  static CLEAR_COLOR = new Color(0.95, 0.95, 0.95, 1.0);  // light gray
  
  /**
   * @param {Color?} clearColor
   */
  constructor(clearColor) {
    this.clearColor = clearColor ?? ClearStage.CLEAR_COLOR;
  }

  /**
   * @param {GPUTextureView} colorView
   * @param {GPUTextureView} depthTextureView
   * @returns {GPURenderPassDescriptor}
   */
  createRenderPassDescriptor(colorView, depthTextureView) {
    /** @type {GPURenderPassDescriptor} */
    const descriptor = {
      colorAttachments: [
        {
          view: colorView,
          clearValue: this.clearColor.toArray(),
          loadOp: "clear",
          storeOp: "store",
        },
      ],
      depthStencilAttachment: {
        view: depthTextureView,
        depthClearValue: 1.0,
        depthLoadOp: "clear",
        depthStoreOp: "store",
      }
    };
    return descriptor;
  }
}
