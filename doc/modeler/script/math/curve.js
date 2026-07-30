// @ts-check
"use strict";

import { Id } from "../util/id.js";

// This curve class represents a 3D curve defined by a set of control points.
// It provides methods to export to lines for rendering. For now, we support
// only straight segments between endpoints, making the conversion to lines
// simple for drawing.
// 
// FUTURE, add support for more complex curves such as Beziers and NURBS.  

export class Curve {
  /** @type {Array<Id>} */
  #boundaryPoints;

  /** @param {Array<Id>} boundaryPoints */
  constructor(boundaryPoints) {
    this.#boundaryPoints = [...boundaryPoints];
  }

  get v0() {
    return this.#boundaryPoints[0];
  }

  /** @param {Id} id */
  set v0(id) {
    this.#boundaryPoints[0] = id;
  }

  /** @returns {Id} */
  get v1() {
    return this.#boundaryPoints[1];
  }

  /** @param {Id} id */
  set v1(id) {
    this.#boundaryPoints[1] = id;
  }

  /** returns {Array<Id>} */
  tesselate() {
    return [this.v0, this.v1]; // Simple line segment for now
  }
}
