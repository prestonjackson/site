"use strict";

import { Id } from "./id.js";

/**
 * Edge - represents a connection between two vertices.
 */
class Edge {
  /**
   * Create an edge between two vertices.
   * @param {Array<Id>} vertexIds - Array containing two vertex IDs
   */
  constructor(vertexIds) {
    this._id = new Id();

    if (!Array.isArray(vertexIds) || vertexIds.length !== 2) {
      throw new Error("Edge requires an array of exactly 2 vertex IDs");
    }

    // Extract vertex IDs
    [this._v1, this._v2] = vertexIds;
  }

  /**
   * Get the first vertex of this edge.
   * @returns {Id} The ID of the first vertex
   */
  get v1() {
    return this._v1;
  }

  set v1(id) {
    this._v1 = id;
  } 

  /**
   * Get the second vertex of this edge.
   * @returns {Id} The ID of the second vertex
   */
  get v2() {
    return this._v2;
  }

  set v2(id) {
    this._v2 = id;
  }

  /**
   * Get both vertices of this edge.
   * @returns {[Id, Id]} Array of the two vertex IDs
   */
  getVertices() {
    return [this._v1, this._v2];
  }

  /**
   * Get the id
   * @returns {Id}
   */
  get id() {
    return this._id;
  }

  set id(value) {
    this._id = value;
  }
}
