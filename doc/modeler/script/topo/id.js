"use strict";

/**
 * Id - A 32-bit identifier wrapper.
 * Can be represented as a unsigned 32-bit integer or a hex string.
 */
export class Id {
  /**
   * @param {number} value - An integer value (0 to 4,294,967,295)
   */
  constructor(value) {
    this._data = new Uint32Array(1);
    // Force into a 32-bit unsigned integer range
    if (value === undefined || value === null) {
      window.crypto.getRandomValues(this._data);
    } else {
      this._data[0] = value >>> 0;
    }
  }

  /**
   * Returns the ID as a numerical index.
   * @returns {number}
   */
  toIndex() {
    return this._data[0];
  }

  /**
   * Returns the ID as a 8-character hex string.
   * @returns {string}
   */
  toString() {
    const bytes = new Uint8Array(this._data.buffer);
    return bytes.toBase64({ 
      alphabet: "base64url", 
      omitPadding: true 
    });
  }

  /**
   * Allows the Id object to be used in numeric comparisons or 
   * math (e.g., id1 < id2).
   */
  valueOf() {
    return this._data[0];
  }
}