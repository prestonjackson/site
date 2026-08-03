// @ts-check
"use strict";

import { Surface } from "../math/surface.js";
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
  /** @type {Surface} */
  #surface;

  /**
   * @param {Array<Id>} edgeIds
   */
  constructor(edgeIds) {
    if (!Array.isArray(edgeIds) || edgeIds.length < 3) {
      throw new Error("Face requires an array of at least 3 edge IDs");
    }
    this.#id = new Id();
    this.#edgeIds = [...edgeIds];  // Copy the array.
    this.#surface = new Surface(this.#edgeIds);
  }

  /**
   * Get the edges of this face.
   * @returns {Array<Id>}
   */
  get edgeIds() {
    return [...this.#edgeIds];  // Return a copy of the array.
  }

  /** Set the edges of this face.
   * @param {Array<Id>} edgeIds
   */
  set edgeIds(edgeIds) {
    this.#edgeIds = [...edgeIds];  // Copy the array.
  }

  /**
   * Get ths surface representation
   * @returns {Surface}
   */
  get surface() {
    return this.#surface;
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
