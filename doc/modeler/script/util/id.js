// @ts-check
"use strict";

/**
 * Id - A 32-bit identifier wrapper.
 * Can be represented as a unsigned 32-bit integer or a hex string.
 */
export class Id {
  /** @type {Uint32Array} */
  #data;

  /** @param {number} [value] - An integer value (0 to 4,294,967,295) */
  constructor(value) {
    this.#data = new Uint32Array(1);
    // Force into a 32-bit unsigned integer range
    if (value === undefined || value === null) {
      // I don't understand why this is necessary, but it seems that crypto.
      // getRandomValues does not work correctly with a Uint32Array stored as
      // an instance variable, so we use a temporary array.
      let tmp = new Uint32Array(1);
      crypto.getRandomValues(tmp);
      this.#data[0] = tmp[0];
    } else {
      this.#data[0] = value >>> 0;
    }
  }

  /**
   * Returns the ID as a numerical index.
   * @returns {number}
   */
  toNumber() {
    return this.#data[0];
  }

  /**
   * Returns the ID as a base64 string.
   * @returns {string}
   */
  toBase64() {
    // Read the data as a Uint8Array for base64 encoding
    const byteArray = new Uint8Array(this.#data.buffer);
    const base64Str = btoa(String.fromCharCode(...byteArray))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return base64Str;
  }

  /**
   * Allows the Id object to be used in numeric comparisons or 
   * math (e.g., id1 < id2).
   */
  valueOf() {
    return this.#data[0];
  }
}