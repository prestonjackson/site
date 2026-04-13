// @ts-check
"use strict";

import { Tool } from "./tool.js";

import { Camera } from "../model/camera.js";

export class Truck extends Tool {
  /** @type {Camera} */
  #camera;
  /** @type {number} */
  #lastX = 0;
  /** @type {number} */
  #lastY = 0;

  /** @param {Camera} camera */
  constructor(camera) {
    super("Truck");
    this.#camera = camera;
  }

  /** @param {number} x @param {number} y @returns {boolean} */
  onMouseDown(x, y) {
    super.onMouseDown(x, y);
    this.#lastX = x;
    this.#lastY = y;

    return false;
  }

  /** @param {number} x @param {number} y @returns {boolean} */
  onMouseMove(x, y) {
    super.onMouseMove(x, y);
    if (!this.isDragging) {
      return false;
    }
    
    const deltaX = x - this.#lastX;
    const deltaY = y - this.#lastY;
    
    // Scale movement by a sensitivity factor
    const sensitivity = 0.002;
    
    this.#camera.truck(deltaX * sensitivity, -deltaY * sensitivity);
    
    this.#lastX = x;
    this.#lastY = y;

    // Indicate that the model was modified, it's dirty.
    return true; 
  }

  /** @param {number} x @param {number} y @returns {boolean} */
  onMouseUp(x, y) {
    super.onMouseUp(x, y);
    return false; 
  }
}
