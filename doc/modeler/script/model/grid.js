"use strict";

import { Topology } from "../topo/topology.js";
import { Point } from "../math/point.js";
import { Color } from "../math/color.js";
import { Size2 } from "../math/size2.js";

/**
 * Grid class - represents a reference grid for rendering in 3D space.
 * Generates vertex data for grid lines in the XY plane.
 */
export class Grid {
  #size;
  #major;
  #minor;
  #color;
  #topology;

  constructor(size = new Size2(10, 10), major = 2, minor = 10) {
    this.#size = size;  // The size of the grid
    this.#major = major;  // The number of major divisions
    this.#minor = minor;  // The number of minor divisions
    this.#color = new Color(0.5, 0.5, 0.5, 1);

    this.#topology = new Topology();
    this.generateVertices();
  }

  /**
   * Generate vertices for the grid lines.
   */
  generateVertices() {
    // For now, simplicity: use major divisions only
    const step = this.#major;
    const halfWidth = this.#size.w / 2;
    const halfHeight = this.#size.h / 2;

    const divX = Math.floor(this.#size.w / step);
    const divY = Math.floor(this.#size.h / step);

    // Horizontal lines
    for (let i = 0; i <= divY; i++) {
      const y = -halfHeight + i * step;
      const v1 = this.#topology.createVertex(new Point(-halfWidth, y, 0));
      const v2 = this.#topology.createVertex(new Point(halfWidth, y, 0));
      this.#topology.createEdge([v1, v2]);
    }

    // Vertical lines
    for (let i = 0; i <= divX; i++) {
      const x = -halfWidth + i * step;
      const v1 = this.#topology.createVertex(new Point(x, -halfHeight, 0));
      const v2 = this.#topology.createVertex(new Point(x, halfHeight, 0));
      this.#topology.createEdge([v1, v2]);
    }
  }

  get topology() {
    return this.#topology;
  }
}