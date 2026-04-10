"use strict";

import { Topology } from "../topo/topology.js";
import { Camera } from "./camera.js";
import { Grid } from "./grid.js";
import { Point } from "../math/point.js";

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
    this._topology = new Topology();

    // Camera for view/projection matrices
    this._camera = new Camera();

    // Grid data (for rendering a reference grid)
    this._grid = new Grid();
  }

  insertTestGeometry() {
    // Add some test geometry
    const v0 = this._topology.createVertex(new Point(-0.5, -0.5, 0));
    const v1 = this._topology.createVertex(new Point(0.5, -0.5, 0));
    const v2 = this._topology.createVertex(new Point(0, 0.5, 0));
    const e0 = this._topology.createEdge([v0, v1]);
    const e1 = this._topology.createEdge([v1, v2]);
    const e2 = this._topology.createEdge([v2, v0]);
    const f0 = this._topology.createFace([e0, e1, e2]);
  }

  get topology() {
    return this._topology;
  }

  get camera() {
    return this._camera;
  }

  get grid() {
    return this._grid;
  }
}
