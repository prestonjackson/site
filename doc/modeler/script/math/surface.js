// @ts-check
"use strict";

import { Id } from "../util/id";

// This Surface class represents a 3D surface defined by a set of control
// points. It provides methods to export to a triangles for rendering. For now,
// we support only flat polygons, making the conversion to tringles simple for
// drawing.
// 
// FUTURE, add support for more complex surfaces such as NURBS.  

export class Surface {
  /** @type {Array<Id>} */
  #controlPoints;

  /** @param {Array<Id>} controlPoints */
  constructor(controlPoints) {
    this.#controlPoints = [...controlPoints];
  }

  get v0() {
    return this.#controlPoints[0];
  }

  /** @param {Id} id */
  set v0(id) {
    this.#controlPoints[0] = id;
  }

  /** @returns {Id} */
  get v1() {
    return this.#controlPoints[1];
  }

  /** @param {Id} id */
  set v1(id) {
    this.#controlPoints[1] = id;
  }

  /** @returns {Id} */
  get v2() {
    return this.#controlPoints[2];
  }

  /** @param {Id} id */
  set v2(id) {
    this.#controlPoints[2] = id;
  }

  /** returns {Array<Id>} */
  tesselate() {
    return [this.v0, this.v1, this.v2]; // Simple triangle for now
  }
}

