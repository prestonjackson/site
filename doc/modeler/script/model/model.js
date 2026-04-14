// @ts-check
"use strict";

import { Topology } from "../topo/topology.js";
import { Camera } from "./camera.js";
import { Grid } from "./grid.js";
import { Point } from "../math/point.js";
import { Mat4 } from "../math/mat4.js";

/**
 * Model class - contains persistent data including topology, camera, and
 * render buffers. Separates geometric structure from rendering and tool
 * interaction state.
 * 
 * Also contains the top-level API for interacting with the model. Other
 * classes (tools, renderers) should interact with the model through this API,
 * rather than directly accessing the topology or GPU buffers.
 */
export class Model {
  #topology;
  #camera;
  #modelMatrix;
  #grid;

  constructor() {
    // Topological data (geometric structure)
    this.#topology = new Topology();

    // Camera for view/projection matrices
    this.#camera = new Camera();

    // Model matrix for transforming world coordinates
    this.#modelMatrix = Mat4.identity();

    // Grid data (for rendering a reference grid)
    this.#grid = new Grid();
  }

  insertTestGeometry() {
    // Add some test geometry
    const v0 = this.#topology.createVertex(new Point(-0.5, -0.5, 0));
    const v1 = this.#topology.createVertex(new Point(0.5, -0.5, 0));
    const v2 = this.#topology.createVertex(new Point(0, 0.5, 0));
    const e0 = this.#topology.createEdge([v0, v1]);
    const e1 = this.#topology.createEdge([v1, v2]);
    const e2 = this.#topology.createEdge([v2, v0]);
    const f0 = this.#topology.createFace([e0, e1, e2]);
  }

  get topology() {
    return this.#topology;
  }

  get camera() {
    return this.#camera;
  }

  get modelMatrix() {
    return this.#modelMatrix;
  }

  get grid() {
    return this.#grid;
  }
}
