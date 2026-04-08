"use strict";

/**
 * Face - represents a polygonal face bounded by edges.
 * Minimum three edges are required to form a face.
 */
class Face {
  constructor(edges) {
    // edges should be an array of Edge instances (minimum 3)
    if (!Array.isArray(edges) || edges.length < 3) {
      throw new Error("Face requires an array of at least 3 edges");
    }
    this.edges = edges;
  }

  /**
   * Get the edges of this face.
   * @returns {Array<Edge>} Array of edges
   */
  getEdges() {
    return this.edges;
  }

  /**
   * Get the number of edges in this face.
   * @returns {number} The number of edges
   */
  getEdgeCount() {
    return this.edges.length;
  }

  /**
   * Get a specific edge by index.
   * @param {number} index - The edge index
   * @returns {Edge} The edge at the specified index
   */
  getEdge(index) {
    if (index < 0 || index >= this.edges.length) {
      throw new Error(`Edge index out of bounds: ${index}`);
    }
    return this.edges[index];
  }

  /**
   * Get all unique vertices of this face.
   * @returns {Array<Vertex>} Array of unique vertices
   */
  getVertices() {
    const vertices = [];
    const seen = new Set();

    for (const edge of this.edges) {
      const [v1, v2] = edge.getVertices();
      
      if (!seen.has(v1)) {
        vertices.push(v1);
        seen.add(v1);
      }
      if (!seen.has(v2)) {
        vertices.push(v2);
        seen.add(v2);
      }
    }

    return vertices;
  }
}
