"use strict";

/**
 * Point - lightweight wrapper around Vec3 for semantic 3D positions.
 */
class Point {
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

  clone() {
    return new Point(this.position);
  }

  toVec3() {
    return this.position.clone();
  }

  translate(offset) {
    const delta = offset instanceof Point ? offset.position : offset;
    return new Point(this.position.add(delta));
  }

  equals(other) {
    const vec = other instanceof Point ? other.position : other;
    return this.x === vec.x && this.y === vec.y && this.z === vec.z;
  }

  static fromVec3(vec3) {
    return new Point(vec3);
  }

  static zero() {
    return new Point(0, 0, 0);
  }
}