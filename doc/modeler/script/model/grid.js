"use strict";

/**
 * Grid class - represents a reference grid for rendering in 3D space.
 * Generates vertex data for grid lines in the XY plane.
 */
class Grid {
  constructor(size = 10, divisions = 10) {
    this.size = size;
    this.divisions = divisions;
    this.vertices = this.generateVertices();
  }

  /**
   * Generate vertices for the grid lines.
   * Returns a Float32Array of positions (x, y, z) for line segments.
   */
  generateVertices() {
    const vertices = [];
    const step = this.size / this.divisions;
    const halfSize = this.size / 2;

    // Horizontal lines (parallel to X-axis)
    for (let i = 0; i <= this.divisions; i++) {
      const y = -halfSize + i * step;
      vertices.push(-halfSize, y, 0); // start
      vertices.push(halfSize, y, 0);  // end
    }

    // Vertical lines (parallel to Y-axis)
    for (let i = 0; i <= this.divisions; i++) {
      const x = -halfSize + i * step;
      vertices.push(x, -halfSize, 0); // start
      vertices.push(x, halfSize, 0);  // end
    }

    return new Float32Array(vertices);
  }

  /**
   * Get the number of vertices (each line segment has 2 vertices).
   */
  getVertexCount() {
    return this.vertices.length / 3; // 3 components per vertex
  }
}