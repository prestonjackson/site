"use strict";

import { Point } from "../math/point.js";
import { Vec3 } from "../math/vec3.js";
import { Id } from "../util/id.js";

/**
 * Vertex - represents a point in 3D space.
 */
class Vertex {
  constructor(point) {
    this._id = new Id();

    // position should be a Point
    this._point = point instanceof Vec3 ? new Point(point) : point;
  }

  /**
   * Get the position of this vertex.
   * @returns {Point} The position vector
   */
  get point() {
    return this._point;
  }

  /**
   * Set the position of this vertex.
   * @param {Point} point - The new position
   */
  set point(point) {
    this._point = point instanceof Vec3 ? new Point(point) : point;
  }

  /**
   * @returns {Id}
   */
  get id() {
    return this._id;
  }

  set id(value) {
    this._id = value;
  }
}
