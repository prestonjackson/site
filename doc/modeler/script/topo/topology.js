// @ts-check
"use strict";

import { Id } from "../util/id.js";
import { Vertex } from "./vertex.js";
import { Edge } from "./edge.js";
import { Face } from "./face.js";
import { Point } from "../math/point.js";

/**
 * Topology class - contains the geometric structure using Vertex, Edge, and Face objects.
 * Manages topological elements independent of rendering or visualization.
 */
export class Topology {
  /** @type {Id} */
  #id;
  /** @type {Map<Id, Vertex>} */
  #vertices = new Map();
  /** @type {Map<Id, Edge>} */
  #edges = new Map();
  /** @type {Map<Id, Face>} */
  #faces = new Map();

  constructor() {
    this.#id = new Id();
  }

  get id() {
    return this.#id;
  }

  /**
   * Add a vertex to the topology.
   * @param {Point} point @returns {Id}
   */
  createVertex(point) {
    const vertex = new Vertex(point);
    this.#vertices.set(vertex.id, vertex);
    return vertex.id;
  }

  /**
   * Get a vertex by index.
   * @param {Id} id @returns {Vertex}
   */
  readVertex(id) {
    const vertex = this.#vertices.get(id);
    if (vertex) {
      return vertex;
    }
    throw new Error(`Vertex with ID ${id} not found`);
  }

  /**
   * Update a vertex's position.
   * @param {Id} id  @param {Point} point @returns {Id}
   */
  updateVertex(id, point) {
    const vertex = this.readVertex(id);
    vertex.point = point;
    return vertex.id;
  }

  /**
   * Delete a vertex by ID.
   * @param {Id} id @return {Id}
   */
  deleteVertex(id) {
    this.#vertices.delete(id);
    return id;
  }

  /**
   * Create an edge between two vertices.
   * @param {Array<Id>} vertexIds @returns {Id}
   */
  createEdge(vertexIds) {
    const edge = new Edge(vertexIds);
    this.#edges.set(edge.id, edge);
    return edge.id;
  }

  /**
   * Read an edge by ID.
   * @param {Id} id @returns {Edge}
   */
  readEdge(id) {
    const edge = this.#edges.get(id);
    if (edge) {
      return edge;
    }
    throw new Error(`Edge with ID ${id} not found`);
  }

  /**
   * Update an edge's connected vertices.
   * @param {Id} id @param {Array<Id>} vertexIds @returns {Id}
   */
  updateEdge(id, vertexIds) {
    const edge = this.readEdge(id);
    [edge.v1, edge.v2] = vertexIds;
    return edge.id;
  }

  /**
   * Delete an edge by ID.
   * @param {Id} id @return {Id}
   */
  deleteEdge(id) {
    this.#edges.delete(id);
    return id;
  }

  /**
   * Create a face from an array of edges.
   * @param {Array<Id>} edgeIds @returns {Id}
   */
  createFace(edgeIds) {
    if (!Array.isArray(edgeIds) || edgeIds.length < 3) {
      throw new Error("Face requires an array of at least 3 edge IDs");
    }
    const face = new Face(edgeIds);
    this.#faces.set(face.id, face);
    return face.id;
  }

  /**
   * Read a face by ID.
   * @param {Id} id @returns {Face}
   */
  readFace(id) {
    const face = this.#faces.get(id);
    if (face) {
      return face;
    }
    throw new Error(`Face with ID ${id} not found`);
  }

  /**
   * Update a face's edges.
   * @param {Id} id @param {Array<Id>} edgeIds @returns {Id}
   */
  updateFace(id, edgeIds) {
    const face = this.readFace(id);
    face.edgeIds = edgeIds;
    return face.id;
  }

  /**
   * Delete a face by ID.
   * @param {Id} id @returns {Id}
   */
  deleteFace(id) {
    this.#faces.delete(id);
    return id;
  }

  /**
   * Get the number of vertices.
   * @returns {number}
   */
  getVertexCount() {
    return this.#vertices.size;
  }

  /**
   * Get the number of edges.
   * @returns {number}
   */
  getEdgeCount() {
    return this.#edges.size;
  }

  /**
   * Get the number of faces.
   * @returns {number}
   */
  getFaceCount() {
    return this.#faces.size;
  }

  /**
   * Clear all topological data.
   */
  clear() {
    this.#vertices.clear();
    this.#edges.clear();
    this.#faces.clear();
  }

  /** @returns {{points: Map<Id, Point>, lines: Map<Id, Array<Id>>, polygons: Map<Id, Array<Id>>}} */
  getGeometry() {
    return {
      points: Array.from(this.#vertices.entries()).reduce((map, [id, vertex]) => {
        map.set(id, vertex.point);
        return map;
      }, new Map()),
      lines: Array.from(this.#edges.entries()).reduce((map, [id, edge]) => {
        map.set(id, edge.vertexIds);
        return map;
      }, new Map()),
      polygons: Array.from(this.#faces.entries()).reduce((map, [id, face]) => {
        map.set(id, face.edgeIds);
        return map;
      }, new Map())
    };
  }
}
