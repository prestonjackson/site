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

  /** @param {Point|Vec3} point */
  constructor(point) {
    if (!(point instanceof Point) && !(point instanceof Vec3)) {
      throw new TypeError("Vertex must be initialized with a Point or Vec3");
    }
    this.#id = new Id();
    this.#point = point instanceof Vec3 ? new Point(point) : point;
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
    this.#point = point instanceof Vec3 ? new Point(point) : point;
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
