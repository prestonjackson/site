// @ts-check
"use strict";

/**
 * Size2 - represents a 2D size with width and height.
 */
export class Size2 {
  /** @type {number} */
  #w;
  /** @type {number} */
  #h;

  /**
   * @param {number} w - The width
   * @param {number} h - The height
   */
  constructor(w = 0, h = 0) {
    this.#w = w;
    this.#h = h;
  }

  get w() {
    return this.#w;
  }

  set w(value) {
    this.#w = value;
  }

  get h() {
    return this.#h;
  }

  set h(value) {
    this.#h = value;
  }

  clone() {
    return new Size2(this.#w, this.#h);
  }
}
