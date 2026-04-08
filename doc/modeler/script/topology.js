"use strict";

/**
 * Topology class - contains the geometric structure using Vertex, Edge, and Face objects.
 * Manages topological elements independent of rendering or visualization.
 */
class Topology {
  constructor() {
    this.vertices = [];  // Array of Vertex objects
    this.edges = [];     // Array of Edge objects
    this.faces = [];     // Array of Face objects
  }

  /**
   * Add a vertex to the topology.
   * @param {vec3} position - The position in 3D space
   * @returns {Vertex} The created vertex
   */
  addVertex(position) {
    const vertex = new Vertex(position);
    const id = this.vertices.push(vertex);
    return id - 1; // Return the index of the added vertex
  }

  /**
   * Get a vertex by index.
   * @param {number} index - The vertex index
   * @returns {Vertex} The vertex at the specified index
   */
  getVertex(index) {
    if (index < 0 || index >= this.vertices.length) {
      throw new Error(`Vertex index out of bounds: ${index}`);
    }
    return this.vertices[index];
  }

  /**
   * Add an edge between two vertices.
   * @param {number} v1Index - First vertex index
   * @param {number} v2Index - Second vertex index
   * @returns {Edge} The created edge
   */
  addEdge(v1Index, v2Index) {
    const v1 = this.getVertex(v1Index);
    const v2 = this.getVertex(v2Index);
    const edge = new Edge(v1, v2);
    const id = this.edges.push(edge);
    return id - 1; // Return the index of the added edge
  }

  /**
   * Get an edge by index.
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
   * Add a face from edges.
   * @param {Array<number>} edgeIndices - Array of edge indices (minimum 3)
   * @returns {Face} The created face
   */
  addFace(edgeIndices) {
    if (!Array.isArray(edgeIndices) || edgeIndices.length < 3) {
      throw new Error("Face requires an array of at least 3 edge indices");
    }
    
    const edges = edgeIndices.map(index => this.getEdge(index));
    const face = new Face(edges);
    const id = this.faces.push(face);
    return face;
  }

  /**
   * Get a face by index.
   * @param {number} index - The face index
   * @returns {Face} The face at the specified index
   */
  getFace(index) {
    if (index < 0 || index >= this.faces.length) {
      throw new Error(`Face index out of bounds: ${index}`);
    }
    return this.faces[index];
  }

  /**
   * Get the number of vertices.
   * @returns {number} The vertex count
   */
  getVertexCount() {
    return this.vertices.length;
  }

  /**
   * Get the number of edges.
   * @returns {number} The edge count
   */
  getEdgeCount() {
    return this.edges.length;
  }

  /**
   * Get the number of faces.
   * @returns {number} The face count
   */
  getFaceCount() {
    return this.faces.length;
  }

  /**
   * Clear all topological data.
   */
  clear() {
    this.vertices = [];
    this.edges = [];
    this.faces = [];
  }
}
