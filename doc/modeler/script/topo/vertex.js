"use strict";

/**
 * Vertex - represents a point in 3D space.
 */
class Vertex {
  constructor(position) {
    // position should be a vec3
    this.position = position;
  }

  /**
   * Get the position of this vertex.
   * @returns {vec3} The position vector
   */
  getPosition() {
    return this.position;
  }

  /**
   * Set the position of this vertex.
   * @param {vec3} position - The new position
   */
  setPosition(position) {
    this.position = position;
  }
}
