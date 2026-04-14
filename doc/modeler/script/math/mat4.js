// @ts-check
"use strict";

import { Vec3 } from "./vec3.js";

/**
 * Mat4 - 4x4 matrix class optimized for WebGPU
 * Stored in column-major order (WebGPU standard)
 */
export class Mat4 {
  /** @type {Float32Array} */
  data;

  /**
   * @param {Float32Array|number[]|null} [data]
   */
  constructor(data = null) {
    if (data && !(data instanceof Float32Array) && !Array.isArray(data)) {
      throw new TypeError("Mat4 data must be a Float32Array or Array");
    }
    if (data && data.length !== 16) {
      throw new Error("Mat4 data must have 16 elements");
    }

    if (data) {
      this.data = new Float32Array(data);
    } else {
      // Initialize as identity matrix
      this.data = new Float32Array(16);
      this.data[0] = 1;
      this.data[5] = 1;
      this.data[10] = 1;
      this.data[15] = 1;
    }
  }

  /**
   * Create a scaling matrix
   * @param {number} x - Scale factor in X direction
   * @param {number} y - Scale factor in Y direction
   * @param {number} z - Scale factor in Z direction
   * @returns {Mat4}
   */
  static scale(x, y, z) {
    const mat = new Mat4();
    mat.data[0] = x;
    mat.data[5] = y;
    mat.data[10] = z;
    return mat;
  }

  clone() {
    return new Mat4(new Float32Array(this.data));
  }

  /**
   * Multiply this matrix by another matrix
   * Result = this * other
   * @param {Mat4} other - The matrix to multiply by
   * @returns {Mat4}
   */
  multiply(other) {
    const a = this.data;
    const b = other.data;
    const result = new Float32Array(16);

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        result[i + j * 4] = 0;
        for (let k = 0; k < 4; k++) {
          result[i + j * 4] += a[i + k * 4] * b[k + j * 4];
        }
      }
    }

    return new Mat4(result);
  }

  /**
   * Transpose this matrix
   */
  transpose() {
    const a = this.data;
    const result = new Mat4();
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        result.data[i * 4 + j] = a[j * 4 + i];
      }
    }
    return result;
  }

  /**
   * Create a translation matrix
   * @param {number} x - Translation in X direction
   * @param {number} y - Translation in Y direction
   * @param {number} z - Translation in Z direction
   * @returns {Mat4}
   */
  static translate(x, y, z) {
    const mat = new Mat4();
    mat.data[12] = x;
    mat.data[13] = y;
    mat.data[14] = z;
    return mat;
  }

  /**
   * Create a rotation matrix around X axis (radians)
   * @param {number} angle - Rotation angle in radians
   * @returns {Mat4}
   */
  static rotateX(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const mat = new Mat4();
    mat.data[5] = cos;
    mat.data[6] = sin;
    mat.data[9] = -sin;
    mat.data[10] = cos;
    return mat;
  }

  /**
   * Create a rotation matrix around Y axis (radians)
   * @param {number} angle - Rotation angle in radians
   * @returns {Mat4}
   */
  static rotateY(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const mat = new Mat4();
    mat.data[0] = cos;
    mat.data[2] = -sin;
    mat.data[8] = sin;
    mat.data[10] = cos;
    return mat;
  }

  /**
   * Create a rotation matrix around Z axis (radians)
   * @param {number} angle - Rotation angle in radians
   * @returns {Mat4}
   */
  static rotateZ(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const mat = new Mat4();
    mat.data[0] = cos;
    mat.data[1] = sin;
    mat.data[4] = -sin;
    mat.data[5] = cos;
    return mat;
  }

  /**
   * Create an identity matrix
   */
  static identity() {
    return new Mat4();
  }

  /**
   * Transform a Vec3 point by this matrix (assumes w=1)
   * @param {Vec3} v - The point to transform
   * @returns {Vec3}
   */
  transformPoint(v) {
    const x = this.data[0] * v.x + this.data[4] * v.y + this.data[8] * v.z + this.data[12];
    const y = this.data[1] * v.x + this.data[5] * v.y + this.data[9] * v.z + this.data[13];
    const z = this.data[2] * v.x + this.data[6] * v.y + this.data[10] * v.z + this.data[14];
    return new Vec3(x, y, z);
  }

  /**
   * Create a rotation matrix around an arbitrary axis
   * Uses Rodrigues' rotation formula
   * @param {Vec3} axis - The axis to rotate around (should be normalized)
   * @param {number} angle - Rotation angle in radians
   * @returns {Mat4}
   */
  static rotateAxis(axis, angle) {
    const a = axis.normalize();
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const oneMinusCos = 1 - cos;

    const mat = new Mat4();

    mat.data[0] = cos + a.x * a.x * oneMinusCos;
    mat.data[1] = a.z * sin + a.y * a.x * oneMinusCos;
    mat.data[2] = a.y * (-sin) + a.z * a.x * oneMinusCos;

    mat.data[4] = a.z * (-sin) + a.x * a.y * oneMinusCos;
    mat.data[5] = cos + a.y * a.y * oneMinusCos;
    mat.data[6] = a.x * sin + a.z * a.y * oneMinusCos;

    mat.data[8] = a.y * sin + a.x * a.z * oneMinusCos;
    mat.data[9] = a.z * (-sin) + a.y * a.z * oneMinusCos;
    mat.data[10] = cos + a.z * a.z * oneMinusCos;

    return mat;
  }

  /**
   * Invert this matrix.
   * @returns {Mat4} the inverse matrix, or identity if matrix is singular.
   */
  invert() {
    const inv = new Mat4();
    const a = this.data;
    const b = inv.data;

    b[0] = a[5] * a[10] * a[15] - a[5] * a[11] * a[14] - a[9] * a[6] * a[15] + a[9] * a[7] * a[14] + a[13] * a[6] * a[11] - a[13] * a[7] * a[10];
    b[4] = -a[4] * a[10] * a[15] + a[4] * a[11] * a[14] + a[8] * a[6] * a[15] - a[8] * a[7] * a[14] - a[12] * a[6] * a[11] + a[12] * a[7] * a[10];
    b[8] = a[4] * a[9] * a[15] - a[4] * a[11] * a[13] - a[8] * a[5] * a[15] + a[8] * a[7] * a[13] + a[12] * a[5] * a[11] - a[12] * a[7] * a[9];
    b[12] = -a[4] * a[9] * a[14] + a[4] * a[10] * a[13] + a[8] * a[5] * a[14] - a[8] * a[6] * a[13] - a[12] * a[5] * a[10] + a[12] * a[6] * a[9];

    b[1] = -a[1] * a[10] * a[15] + a[1] * a[11] * a[14] + a[9] * a[2] * a[15] - a[9] * a[3] * a[14] - a[13] * a[2] * a[11] + a[13] * a[3] * a[10];
    b[5] = a[0] * a[10] * a[15] - a[0] * a[11] * a[14] - a[8] * a[2] * a[15] + a[8] * a[3] * a[14] + a[12] * a[2] * a[11] - a[12] * a[3] * a[10];
    b[9] = -a[0] * a[9] * a[15] + a[0] * a[11] * a[13] + a[8] * a[1] * a[15] - a[8] * a[3] * a[13] - a[12] * a[1] * a[11] + a[12] * a[3] * a[9];
    b[13] = a[0] * a[9] * a[14] - a[0] * a[10] * a[13] - a[8] * a[1] * a[14] + a[8] * a[2] * a[13] + a[12] * a[1] * a[10] - a[12] * a[2] * a[9];

    b[2] = a[1] * a[6] * a[15] - a[1] * a[7] * a[14] - a[5] * a[2] * a[15] + a[5] * a[3] * a[14] + a[13] * a[2] * a[7] - a[13] * a[3] * a[6];
    b[6] = -a[0] * a[6] * a[15] + a[0] * a[7] * a[14] + a[4] * a[2] * a[15] - a[4] * a[3] * a[14] - a[12] * a[2] * a[7] + a[12] * a[3] * a[6];
    b[10] = a[0] * a[5] * a[15] - a[0] * a[7] * a[13] - a[4] * a[1] * a[15] + a[4] * a[3] * a[13] + a[12] * a[1] * a[7] - a[12] * a[3] * a[5];
    b[14] = -a[0] * a[5] * a[14] + a[0] * a[6] * a[13] + a[4] * a[1] * a[14] - a[4] * a[2] * a[13] - a[12] * a[1] * a[6] + a[12] * a[2] * a[5];

    b[3] = -a[1] * a[6] * a[11] + a[1] * a[7] * a[10] + a[5] * a[2] * a[11] - a[5] * a[3] * a[10] - a[9] * a[2] * a[7] + a[9] * a[3] * a[6];
    b[7] = a[0] * a[6] * a[11] - a[0] * a[7] * a[10] - a[4] * a[2] * a[11] + a[4] * a[3] * a[10] + a[8] * a[2] * a[7] - a[8] * a[3] * a[6];
    b[11] = -a[0] * a[5] * a[11] + a[0] * a[7] * a[9] + a[4] * a[1] * a[11] - a[4] * a[3] * a[9] - a[8] * a[1] * a[7] + a[8] * a[3] * a[5];
    b[15] = a[0] * a[5] * a[10] - a[0] * a[6] * a[9] - a[4] * a[1] * a[10] + a[4] * a[2] * a[9] + a[8] * a[1] * a[6] - a[8] * a[2] * a[5];

    const det = a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12];

    if (det === 0) {
      return new Mat4(); // Return identity on singular matrix
    }

    const invDet = 1 / det;
    for (let i = 0; i < 16; i++) {
      b[i] *= invDet;
    }

    return inv;
  }
}
