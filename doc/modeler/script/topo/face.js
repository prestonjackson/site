"use strict";

import { Id } from "./id.js";

/**
 * Face - represents a polygonal face bounded by edges.
 * Minimum three edges are required to form a face.
 */
class Face {
  constructor(edges) {
    this._id = new Id();

    // Edges should be an array of Edge IDs (minimum 3)
    if (!Array.isArray(edges) || edges.length < 3) {
      throw new Error("Face requires an array of at least 3 edges");
    }
    // Check to make sure all three edges form a closed loop (i.e. they share
    // vertices)
    // TODO: Implement loop check
    
    this._edges = edges;
  }

  /**
   * Get the edges of this face.
   * @returns {Array<Id>} Array of edges
   */
  get edges() {
    return this._edges;
  }

  get id() {
    return this._id;
  }

  set id(value) {
    this._id = value;
  }
}
