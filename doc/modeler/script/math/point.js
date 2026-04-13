// @ts-check
"use strict";

import { Vec3 } from "./vec3.js";

/**
 * Point - lightweight wrapper around Vec3 for semantic 3D positions.
 */
export class Point {
  /** @type {Vec3} */
  position;

  /**
   * @param {Point|Vec3|number} x 
   * @param {number} [y] 
   * @param {number} [z] 
   */
  constructor(x = 0, y = 0, z = 0) {
    if (x instanceof Point) {
      this.position = x.position.clone();
    } else if (x instanceof Vec3) {
      this.position = x.clone();
    } else {
      this.position = new Vec3(x, y, z);
    }
  }

  get x() { return this.position.x; }
  get y() { return this.position.y; }
  get z() { return this.position.z; }

  set x(value) { this.position.x = value; }
  set y(value) { this.position.y = value; }
  set z(value) { this.position.z = value; }

  /** @returns {Point} */
  clone() {
    return new Point(this.position);
  }

  /** @returns {Vec3} */
  toVec3() {
    return this.position.clone();
  }

  /** @param {Point|Vec3} offset @returns {Point} */
  translate(offset) {
    const delta = offset instanceof Point ? offset.position : offset;
    return new Point(this.position.add(delta));
  }

  /** @param {Point|Vec3} other @returns {boolean} */
  equals(other) {
    const vec = other instanceof Point ? other.position : other;
    return this.x === vec.x && this.y === vec.y && this.z === vec.z;
  }

  /** @param {Vec3} vec3 @returns {Point} */
  static fromVec3(vec3) {
    return new Point(vec3);
  }

  /** @returns {Point} */
  static zero() {
    return new Point(0, 0, 0);
  }
}