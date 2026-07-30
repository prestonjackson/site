// @ts-check
"use strict";

import { Id } from "../util/id.js";
import { Curve } from "../math/curve.js";

/**
 * Edge - represents a connection between two vertices.
 */
export class Edge {
  /** @type {Id} */
  #id;
  /** @type {Curve} */
  #curve;

  /**
   * Create an edge between two vertices.
   * @param {Array<Id>} vertexIds
   */
  constructor(vertexIds) {
    this.#id = new Id();
    this.#curve = new Curve(vertexIds);
  }

  /**
   * Get the first vertex of this edge.
   * @returns {Id}
   */
  get v0() {
    return this.#curve.v0;
  }

  set v0(id) {
    this.#curve.v0 = id;
  }

  /**
   * Get the second vertex of this edge.
   * @returns {Id}
   */
  get v1() {
    return this.#curve.v1;
  }

  set v1(id) {
    this.#curve.v1 = id;
  }

  /**
   * Get both vertices of this edge.
   * @returns {Array<Id>}
   */
  get vertexIds() {
    return [this.#curve.v0, this.#curve.v1];
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
