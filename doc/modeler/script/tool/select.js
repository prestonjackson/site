// @ts-check
"use strict";

import { Tool } from "./tool.js";

/** Selection tool, to pick items in the model for manipulation. */
export class Select extends Tool {
  #lastX = 0;
  #lastY = 0;

  constructor() {
    super("Select");
  }

  activate() {
    super.activate();
  }

  /** @param {number} x @param {number} y @returns {boolean} */
  onMouseDown(x, y) {
    super.onMouseDown(x, y);
    this.#lastX = x;
    this.#lastY = y;
    return true;
  }

  /** @param {number} x @param {number} y @returns {boolean} */
  onMouseMove(x, y) {
    super.onMouseMove(x, y);
    if (!this.isDragging) {
      return false;
    }
    
    const deltaX = x - this.#lastX;
    const deltaY = y - this.#lastY;
    
    console.log(`dragging: delta (${deltaX}, ${deltaY})`);
    
    this.#lastX = x;
    this.#lastY = y;
    return true;
  }

  /** @param {number} x @param {number} y @returns {boolean} */
  onMouseUp(x, y) {
    super.onMouseUp(x, y);
    return true;
  }
}
