// @ts-check
"use strict";

import { Point } from "../math/point.js";
import { Vec3 } from "../math/vec3.js";
import { Id } from "../util/id.js";

/**
 * Vertex - represents a point in 3D space.
 */
export class Vertex {
  /** @type {Id} */
  #id;
  /** @type {Point} */
  #point;

  /** @param {Point} point */
  constructor(point) {
    this.#id = new Id();
    this.#point = point.clone();
  }

  /**
   * Get the position of this vertex.
   * @returns {Point}
   */
  get point() {
    return this.#point;
  }

  /**
   * Set the position of this vertex.
   * @param {Point} point
   */
  set point(point) {
    this.#point.copy(point);
  }

  /**
   * @returns {Id}
   */
  get id() {
    return this.#id;
  }

  /**
   * @param {Id} value
   */
  set id(value) {
    this.#id = value;
  }
}
