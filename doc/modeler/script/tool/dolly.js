// @ts-check
"use strict";

import { Tool } from "./tool.js";

import { Camera } from "../model/camera.js";

export class Dolly extends Tool {
  /** @type {Camera} */
  #camera;
  /** @type {number} */
  #lastY = 0;

  /** @param {Camera} camera */
  constructor(camera) {
    super("Dolly");
    this.#camera = camera;
  }

  /** @param {number} x @param {number} y @returns {boolean} */
  onMouseDown(x, y) {
    super.onMouseDown(x, y);
    this.#lastY = y;

    return false;
  }

  /** @param {number} x @param {number} y @returns {boolean} */
  onMouseMove(x, y) {
    super.onMouseMove(x, y);
    if (this.isDragging) {
      return false;
    }

    const deltaY = y - this.#lastY;
    
    // Scale movement by a sensitivity factor
    const sensitivity = 0.002;
    
    if (this.#camera) {
      this.#camera.dolly(-deltaY * sensitivity);
    }

    this.#lastY = y;

    return true;
  }

  /** @param {number} x @param {number} y @returns {boolean} */
  onMouseUp(x, y) {
    super.onMouseUp(x, y);
    return false;
  }
}
