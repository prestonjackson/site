// @ts-check
"use strict";

import { Tool } from "./tool.js";

export class Rectangle extends Tool {
  /** @type {boolean} */
  #isDrawing = false;
  /** @type {number} */
  #startX = 0;
  /** @type {number} */
  #startY = 0;
  /** @type {number} */
  #lastX = 0;
  /** @type {number} */
  #lastY = 0;

  constructor() {
    super("Rectangle");
  }

  /** @param {number} x @param {number} y @returns {boolean} */
  onMouseDown(x, y) {
    super.onMouseDown(x, y);
    this.#isDrawing = true;
    this.#startX = x;
    this.#startY = y;
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
    
    const width = x - this.#startX;
    const height = y - this.#startY;
    
    console.log(`drawing: size (${width}, ${height})`);
    
    this.#lastX = x;
    this.#lastY = y;
    return true;
  }

  /** @param {number} x @param {number} y @returns {boolean} */
  onMouseUp(x, y) {
    super.onMouseUp(x, y);
    this.#isDrawing = false;
    return true;
  }
}
