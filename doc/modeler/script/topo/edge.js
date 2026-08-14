// @ts-check
"use strict";

import { Id } from "../util/id.js";
import { Curve } from "../math/curve.js";
import { Vertex } from "./vertex.js";

/**
 * Edge - represents a connection between two vertices.
 */
export class Edge {
  /** @type {Id} */
  #id;
  /** @type {Array<Vertex>} */
  #vertices;
  /** @type {Curve} */
  #curve;

  /**
   * Create an edge between two vertices.
   * @param {Array<Vertex>} vertices
   */
  constructor(vertices) {
    this.#id = new Id();
    this.#vertices = [...vertices];

    const points = this.#vertices.map(vertex => vertex.point);
    this.#curve = new Curve(points, []);
  }

  /**
   * Get the first vertex of this edge.
   * @returns {Vertex}
   */
  get v0() {
    return this.#vertices[0];
  }

  /**
   * Get the second vertex of this edge.
   * @returns {Vertex}
   */
  get v1() {
    return this.#vertices[1];
  }

  /**
   * Get the curve of this edge.
   * @returns {Curve}
   */
  get curve() {
    return this.#curve;
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
