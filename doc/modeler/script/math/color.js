// @ts-check
"use strict";

/**
 * Color - RGBA color class optimized for WebGPU
 */
export class Color {
  /** @type {Float32Array} */
  data;

  /**
   * @param {number} r
   * @param {number} g
   * @param {number} b
   * @param {number} a
   */
  constructor(r = 0, g = 0, b = 0, a = 1) {
    this.data = new Float32Array(4);
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  /** @param {string} hex @returns {Color} */
  static fromHex(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    const bigint = parseInt(hex, 16);
    const r = ((bigint >> 16) & 255) / 255;
    const g = ((bigint >> 8) & 255) / 255;
    const b = (bigint & 255) / 255;
    return new Color(r, g, b, 1);
  }

  get r() { return this.data[0]; }
  get g() { return this.data[1]; }
  get b() { return this.data[2]; }
  get a() { return this.data[3]; }

  set r(v) { this.data[0] = Math.max(0, Math.min(1, v)); }
  set g(v) { this.data[1] = Math.max(0, Math.min(1, v)); }
  set b(v) { this.data[2] = Math.max(0, Math.min(1, v)); }
  set a(v) { this.data[3] = Math.max(0, Math.min(1, v)); }

  clone() {
    return new Color(this.r, this.g, this.b, this.a);
  }

  toArray() {
    return [this.r, this.g, this.b, this.a];
  }

  static white() { return new Color(1, 1, 1, 1); }
  static black() { return new Color(0, 0, 0, 1); }
  static red() { return new Color(1, 0, 0, 1); }
  static green() { return new Color(0, 1, 0, 1); }
  static blue() { return new Color(0, 0, 1, 1); }
}
