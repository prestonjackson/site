"use strict";

import { Id } from "../util/id.js";
import { Vertex } from "./vertex.js";
import { Edge } from "./edge.js";
import { Face } from "./face.js";

/**
 * Topology class - contains the geometric structure using Vertex, Edge, and Face objects.
 * Manages topological elements independent of rendering or visualization.
 */
class Topology {
  constructor() {
    this.vertices = {};  // Map of Vertex objects
    this.edges = {};     // Map of Edge objects
    this.faces = {};     // Map of Face objects
  }

  /**
   * Add a vertex to the topology.
   * @param {Point} point - The position in 3D space
   * @returns {Id} The ID of the added vertex
   */
  createVertex(point) {
    const vertex = new Vertex(point);
    this.vertices[vertex.id] = vertex;
    return vertex.id;
  }

  /**
   * Get a vertex by index.
   * @param {Id} id - The vertex ID
   * @returns {Vertex} The vertex with the specified ID
   */
  readVertex(id) {
    const vertex = this.vertices[id];
    if (vertex) {
      return vertex;
    }
    throw new Error(`Vertex with ID ${id} not found`);
  }

  /**
   * Update a vertex's position.
   * @param {Id} id - The vertex ID
   * @param {Point} point - The new position in 3D space
   * @returns {Id} The updated vertex's ID
   */
  updateVertex(id, point) {
    const vertex = this.readVertex(id);
    vertex.point = point;
    return vertex.id;
  }

  /**
   * Delete a vertex by ID.
   * @param {Id} id - The vertex ID to delete
   * @return {Id} The ID of the deleted vertex
   */
  deleteVertex(id) {
    delete this.vertices[id];
    return id;
  }

  /**
   * Create an edge between two vertices.
   * @param {Array<Id>} vertexIds - Array of two vertex IDs
   * @returns {Id} The created edge's ID
   */
  createEdge(vertexIds) {
    const edge = new Edge(vertexIds);
    this.edges[edge.id] = edge;
    return edge.id;
  }

  /**
   * Read an edge by ID.
   * @param {Id} id - The edge ID
   * @returns {Edge} The edge with the specified ID
   */
  readEdge(id) {
    const edge = this.edges[id];
    if (edge) {
      return edge;
    }
    throw new Error(`Edge with ID ${id} not found`);
  }

  /**
   * Update an edge's connected vertices.
   * @param {Id} id - The edge ID
   * @param {Array<Id>} vertexIds - New array of two vertex IDs
   * @returns {Id} The edge ID
   */
  updateEdge(id, vertexIds) {
    const edge = this.readEdge(id);
    [edge.v1, edge.v2] = vertexIds;
    return edge.id;
  }

  /**
   * Delete an edge by ID.
   * @param {Id} id - The edge ID to delete
   * @return {Id} The ID of the deleted edge
   */
  deleteEdge(id) {
    delete this.edges[id];
    return id;
  }
  
  /**
   * Create a face from an array of edges.
   * @param {Array<Id>} edgeIds - Array of edge IDs (minimum 3)
   * @returns {Id} The created face ID
   */
  createFace(edgeIds) {
    if (!Array.isArray(edgeIds) || edgeIds.length < 3) {
      throw new Error("Face requires an array of at least 3 edge IDs");
    }
    
    const edges = edgeIds.map(id => this.readEdge(id));
    const face = new Face(edges);
    this.faces[face.id] = face;
    return face.id;
  }

  /**
   * Read a face by ID.
   * @param {Id} id - The face ID
   * @returns {Face} The face with the specified ID
   */
  readFace(id) {
    const face = this.faces[id];
    if (face) {
      return face;
    }
    throw new Error(`Face with ID ${id} not found`);
  }

  /**
   * Update a face's edges.
   * @param {Id} id - The face ID
   * @param {Array<Id>} edgeIds - New array of edge IDs
   * @returns {Id} The face ID
   */
  updateFace(id, edgeIds) {
    const face = this.readFace(id);
    face.id = id; // Ensure ID matches, though usually fixed
    // Assuming Face setter for edges exists
    const edges = edgeIds.map(eId => this.readEdge(eId));
    face.edges = edges;
    return face.id;
  }

  /**
   * Delete a face by ID.
   * @param {Id} id - The face ID to delete
   * @returns {Id} The ID of the deleted face
   */
  deleteFace(id) {
    delete this.faces[id];
    return id;
  }

  /**
   * Get the number of vertices.
   * @returns {number} The vertex count
   */
  getVertexCount() {
    return Object.keys(this.vertices).length;
  }

  /**
   * Get the number of edges.
   * @returns {number} The edge count
   */
  getEdgeCount() {
    return Object.keys(this.edges).length;
  }

  /**
   * Get the number of faces.
   * @returns {number} The face count
   */
  getFaceCount() {
    return Object.keys(this.faces).length;
  }

  /**
   * Clear all topological data.
   */
  clear() {
    this.vertices = {};
    this.edges = {};
    this.faces = {};
  }
}
