// @ts-check
"use strict";

import { Id } from "../util/id.js";

/**
 * Edge - represents a connection between two vertices.
 */
export class Edge {
  /** @type {Id} */
  #id;
  /** @type {Id} */
  #v1;
  /** @type {Id} */
  #v2;

  /**
   * Create an edge between two vertices.
   * @param {Array<Id>} vertexIds
   */
  constructor(vertexIds) {
    this.#id = new Id();

    if (!Array.isArray(vertexIds) || vertexIds.length !== 2) {
      throw new Error("Edge requires an array of exactly 2 vertex IDs");
    }

    vertexIds.forEach(id => {
      if (!(id instanceof Id) && typeof id !== 'string') {
        throw new TypeError("Vertex ID must be an instance of Id or a string");
      }
    });

    [this.#v1, this.#v2] = vertexIds;
  }

  /**
   * Get the first vertex of this edge.
   * @returns {Id}
   */
  get v1() {
    return this.#v1;
  }

  set v1(id) {
    this.#v1 = id;
  }

  /**
   * Get the second vertex of this edge.
   * @returns {Id}
   */
  get v2() {
    return this.#v2;
  }

  set v2(id) {
    this.#v2 = id;
  }

  /**
   * Get both vertices of this edge.
   * @returns {[Id, Id]}
   */
  get vertexIds() {
    return [this.#v1, this.#v2];
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
