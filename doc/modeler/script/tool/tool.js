// @ts-check
"use strict";

/**
 * Base class for tools that handle mouse events on the canvas.
 * Tools are activated/deactivated and receive mouse events (down, move, up)
 * while active.
 */
export class Tool {
  /** @type {string} */
  #name;
  /** @type {boolean} */
  #isActive = false;
  /** @type {boolean} */
  #isDragging = false;


  /** @param {string} name */
  constructor(name) {
    this.#name = name;
  }

  get isActive() {
    return this.#isActive;
  }

  get isDragging() {
    return this.#isDragging;
  }

  /**
   * Called when this tool is activated (becomes the active tool).
   */
  activate() {
    this.#isActive = true;
  }

  /**
   * Called when this tool is deactivated (another tool takes over or app closes).
   */
  deactivate() {
    this.#isActive = false;
  }

  /**
   * Called when the mouse button is pressed on the canvas while this tool is active.
   * @param {number} x - The x-coordinate of the mouse event
   * @param {number} y - The y-coordinate of the mouse event
   * @return {boolean} - Return true re-rendering is required
   */
  onMouseDown(x, y) {
    console.log(`${this.#name} ouseDown at (${x}, ${y})`);
    this.#isDragging = true;
    return false;
  }

  /**
   * Called when the mouse moves on the canvas while this tool is active.
   * @param {number} x - The x-coordinate of the mouse event
   * @param {number} y - The y-coordinate of the mouse event
   * @return {boolean} - Return true re-rendering is required
   */
  onMouseMove(x, y) {
    if (this.#isDragging) {
      console.log(`${this.#name} mouseDrag at (${x}, ${y})`);
    }
    return false;
  }

  /**
   * Called when the mouse button is released while this tool is active.
   * @param {number} x - The x-coordinate of the mouse event
   * @param {number} y - The y-coordinate of the mouse event
   * @return {boolean} - Return true re-rendering is required
   */
  onMouseUp(x, y) {
    console.log(`${this.#name} mouseUp at (${x}, ${y})`);
    this.#isDragging = false;
    return false;
  }
}
