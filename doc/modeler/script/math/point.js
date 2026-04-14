// @ts-check
"use strict";

import { Vec3 } from "./vec3.js";

/**
 * Point - lightweight wrapper around Vec3 for semantic 3D positions.
 */
export class Point {
  /** @type {Number} */
  #x;
  /** @type {Number} */ 
  #y;
  /** @type {Number} */
  #z;

  /**
   * @param {number} x 
   * @param {number} y
   * @param {number} z 
   */
  constructor(x = 0, y = 0, z = 0) {
    this.#x = x;
    this.#y = y;
    this.#z = z;
  }

  get x() { return this.#x; }
  get y() { return this.#y; }
  get z() { return this.#z; }

  set x(value) { this.#x = value; }
  set y(value) { this.#y = value; }
  set z(value) { this.#z = value; }

  /** @returns {Point} */
  clone() {
    return new Point(this.#x, this.#y, this.#z);
  }

  /** @param {Point} other @returns {Point} */
  copy(other) {
    this.#x = other.x;
    this.#y = other.y;
    this.#z = other.z;
    return this;
  }

  /** @returns {Vec3} */
  toVec3() {
    return new Vec3(this.#x, this.#y, this.#z);
  }

  /** @param {Point} augend @param {Vec3} addend @returns {Point} */
  static add(augend, addend) {
    return new Point(augend.x + addend.x,
                     augend.y + addend.y,
                     augend.z + addend.z);
  }

  /** @param {Vec3} addend @returns {Point} */
  add(addend) {
    this.#x += addend.x;
    this.#y += addend.y;
    this.#z += addend.z;
    return this;
  }

  /**
   * @param {Point} minuend @param {Point} subtrahend @returns {Vec3}
   */
  static subtract(minuend, subtrahend) {
    return new Vec3(minuend.x - subtrahend.x,
                    minuend.y - subtrahend.y,
                    minuend.z - subtrahend.z);
  }

  /** @param {Point} subtrahend @returns {Vec3} */
  subtract(subtrahend) {
    return new Vec3(this.x - subtrahend.x,
                    this.y - subtrahend.y,
                    this.z - subtrahend.z);
  }

  /** @param {Point|Vec3} other @returns {boolean} */
  equals(other) {
    return this.x === other.x && this.y === other.y && this.z === other.z;
  }

  /** @param {Vec3} vec @returns {Point} */
  static fromVec3(vec) {
    return new Point(vec.x, vec.y, vec.z);
  }

  /** @returns {Point} */
  static zero() {
    return new Point(0, 0, 0);
  }
}