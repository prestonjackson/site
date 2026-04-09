"use strict";

import { Topology } from "./topology.js";
import { Camera } from "./camera.js";
import { Grid } from "./grid.js";

/**
 * Model class - contains persistent data including topology, camera, and
 * render buffers. Separates geometric structure from rendering and tool
 * interaction state.
 * 
 * Also contains the top-level API for interacting with the model. Other
 * classes (tools, renderers) should interact with the model through this API,
 * rather than directly accessing the topology or GPU buffers.
 */
class Model {
  constructor() {
    // Topological data (geometric structure)
    this.topology = new Topology();

    // Camera for view/projection matrices
    this.camera = new Camera();

    // Grid data (for rendering a reference grid)
    this.grid = new Grid();
  }

  /**
   * Add a vertex to the model (delegates to topology).
   * @param {Point} p - The position of the vertex to add
   * @returns {Id} The ID of the added vertex
   */
  addVertex(p) {
    return this.topology.createVertex(p);
  }

  /**
   * Add an edge between two vertices (delegates to topology).
   * @param {Array<Id>} vertexIds - Array of two vertex IDs
   * @returns {Id} The ID of the added edge
   */
  addEdge(vertexIds) {
    return this.topology.createEdge(vertexIds);
  }

  /**
   * Add a triangular face (delegates to topology).
   * @param {Array<Id>} edgeIds - Array of three edge IDs
   * @returns {Id} The ID of the added face
   */
  addFace(edgeIds) {
    return this.topology.createFace(edgeIds);
  }

  /**
   * Get the view matrix from the camera for rendering.
   * @returns {mat4} The 4x4 view matrix as a flat array
  */
  getViewMatrix() {
    return this.camera.getViewMatrix();
  }

  /**
   * Get the projection matrix from the camera for rendering.
   * @returns {mat4} The 4x4 projection matrix as a flat array
   */
  getProjectionMatrix() {
    return this.camera.getProjectionMatrix();
  }
}
