// @ts-check
"use strict";

import { Id } from "../util/id.js";

/**
 * Edge - represents a connection between two vertices.
 */
export class Edge {
  /** @type {Id} */
  #id;
  /** @type {Array<Id>} */
  #vertexIds;

  /**
   * Create an edge between two vertices.
   * @param {Array<Id>} vertexIds
   */
  constructor(vertexIds) {
    if (!Array.isArray(vertexIds) || vertexIds.length !== 2) {
      throw new Error("Edge requires an array of exactly 2 vertex IDs");
    }
    this.#id = new Id();
    this.#vertexIds = [...vertexIds];  // Copy the array.
  }

  /**
   * Get the first vertex of this edge.
   * @returns {Id}
   */
  get v1() {
    return this.#vertexIds[0];
  }

  set v1(id) {
    this.#vertexIds[0] = id;
  }

  /**
   * Get the second vertex of this edge.
   * @returns {Id}
   */
  get v2() {
    return this.#vertexIds[1];
  }

  set v2(id) {
    this.#vertexIds[1] = id;
  }

  /**
   * Get both vertices of this edge.
   * @returns {Array<Id>}
   */
  get vertexIds() {
    return [...this.#vertexIds];
  }

  /**
   * Get the id
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
