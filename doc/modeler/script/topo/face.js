// @ts-check
"use strict";

import { Id } from "../util/id.js";

/*
 * Face - represents a polygonal face bounded by edges.
 * Minimum three edges are required to form a face.
 */
export class Face {
  /** @type {Id} */
  #id;
  /** @type {Array<Id>} */
  #edgeIds;

  /**
   * @param {Array<Id>} edgeIds
   */
  constructor(edgeIds) {
    this.#id = new Id();
    this.#edgeIds = edgeIds;
  }

  /**
   * Get the edges of this face.
   * @returns {Array<Id>}
   */
  get edgeIds() {
    return this.#edgeIds;
  }

  /**
   * @returns {Id}
   */
  get id() {
    return this.#id;
  }

  /**
   * @param {Id} value
   */
  set id(value) {
    this.#id = value;
  }
}
