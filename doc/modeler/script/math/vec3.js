"use strict";

/**
 * Vec3 - 3D vector class optimized for WebGPU
 */
class Vec3 {
  constructor(x = 0, y = 0, z = 0) {
    this.data = new Float32Array([x, y, z]);
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

  add(other) {
    return new Vec3(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  subtract(other) {
    return new Vec3(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  scale(scalar) {
    return new Vec3(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  dot(other) {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  }

  cross(other) {
    return new Vec3(
      this.y * other.z - this.z * other.y,
      this.z * other.x - this.x * other.z,
      this.x * other.y - this.y * other.x
    );
  }

  length() {
    return Math.sqrt(this.dot(this));
  }

  normalize() {
    const len = this.length();
    if (len === 0) return new Vec3(0, 0, 0);
    return this.scale(1 / len);
  }

  static zero() { return new Vec3(0, 0, 0); }
  static unitX() { return new Vec3(1, 0, 0); }
  static unitY() { return new Vec3(0, 1, 0); }
  static unitZ() { return new Vec3(0, 0, 1); }
}
