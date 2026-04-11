// @ts-check
"use strict";

/**
 * Vec3 - 3D vector class optimized for WebGPU
 */
export class Vec3 {
  /** @type {Float32Array} */
  data;

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  constructor(x = 0, y = 0, z = 0) {
    if (typeof x !== 'number' || typeof y !== 'number' || typeof z !== 'number') {
      throw new TypeError("Vec3 components must be numbers");
    }
    this.data = new Float32Array([x, y, z]);
  }

  static fromArray(arr) {
    if (!Array.isArray(arr) && !(arr instanceof Float32Array)) {
      throw new TypeError("Argument must be an array or Float32Array");
    }
    if (arr.length < 3) {
      throw new Error("Array must have at least 3 elements");
    }
    return new Vec3(arr[0], arr[1], arr[2]);
  }

  get x() { return this.data[0]; }
  get y() { return this.data[1]; }
  get z() { return this.data[2]; }

  set x(v) { this.data[0] = v; }
  set y(v) { this.data[1] = v; }
  set z(v) { this.data[2] = v; }

  clone() {
    return new Vec3(this.x, this.y, this.z);
  }
  /**
   * @param {Vec3} other @returns {Vec3}
   */
  add(other) {
    if (!(other instanceof Vec3)) throw new TypeError("Argument must be a Vec3");
    return new Vec3(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  /**
   * @param {Vec3} other @returns {Vec3}
   */
  subtract(other) {
    if (!(other instanceof Vec3)) throw new TypeError("Argument must be a Vec3");
    return new Vec3(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  /**
   * @param {number} scalar @returns {Vec3}
   */
  scale(scalar) {
    if (typeof scalar !== 'number') throw new TypeError("Scalar must be a number");
    return new Vec3(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  /**
   * @param {Vec3} other @returns {number}
   */
  dot(other) {
    if (!(other instanceof Vec3)) throw new TypeError("Argument must be a Vec3");
    return this.x * other.x + this.y * other.y + this.z * other.z;
  }

  /**
   * @param {Vec3} other @returns {Vec3}
   */
  cross(other) {
    if (!(other instanceof Vec3)) throw new TypeError("Argument must be a Vec3");
    return new Vec3(
      this.y * other.z - this.z * other.y,
      this.z * other.x - this.x * other.z,
      this.x * other.y - this.y * other.x
    );
  }

  /** @returns {number} */
  length() {
    return Math.sqrt(this.dot(this));
  }

  /** @returns {Vec3} */
  normalize() {
    const len = this.length();
    if (len === 0) return new Vec3(0, 0, 0);
    return this.scale(1 / len);
  }

  /** @returns {Vec3} */
  static zero() { return new Vec3(0, 0, 0); }
  /** @returns {Vec3} */
  static unitX() { return new Vec3(1, 0, 0); }
  /** @returns {Vec3} */
  static unitY() { return new Vec3(0, 1, 0); }
  /** @returns {Vec3} */
  static unitZ() { return new Vec3(0, 0, 1); }
}
