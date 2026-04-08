"use strict";

/**
 * Edge - represents a connection between two vertices.
 */
class Edge {
  constructor(v1, v2) {
    // v1 and v2 should be Vertex instances
    this.v1 = v1;
    this.v2 = v2;
  }

  /**
   * Get the first vertex of this edge.
   * @returns {Vertex} The first vertex
   */
  getV1() {
    return this.v1;
  }

  /**
   * Get the second vertex of this edge.
   * @returns {Vertex} The second vertex
   */
  getV2() {
    return this.v2;
  }

  /**
   * Get both vertices of this edge.
   * @returns {[Vertex, Vertex]} Array of the two vertices
   */
  getVertices() {
    return [this.v1, this.v2];
  }
}
