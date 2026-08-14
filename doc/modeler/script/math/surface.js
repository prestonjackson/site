// @ts-check
"use strict";

import { Curve } from "./curve.js";
import { Point } from "./point.js";

// This Surface class represents a 3D surface defined by a set of control
// points. It provides methods to export to a triangles for rendering. For now,
// we support only flat polygons, making the conversion to tringles simple for
// drawing.
// 
// FUTURE, add support for more complex surfaces such as NURBS.  

export class Surface {
  /** @type {Array<Curve>} Boundary curves */
  #curves;
  /** @type {Array<Point>} Control points */
  #controls;

  /** @param {Array<Curve>} curves @param {Array<Point>} controls */
  constructor(curves, controls) {
    if (curves.length < 3) {
      throw new Error("A surface must have at least 3 boundary curves");
    }
    this.#curves = [...curves];
    this.#controls = [...controls];
  }

  /**
   * Get the boundary curves defining the surface.
   * @returns {Array<Curve>} The array of curves.
   */
  get curves() {
    return this.#curves;
  }

  /**
   * Get the control points for the surface.
   * @returns {Array<Point>} The array of control points.
   */
  get controls() {
    return this.#controls;
  }

  /** @returns {Array<Point>} */
  tesselate() {
     // Simple triangle for now
    return [this.curves[0].points[0],
            this.curves[1].points[0],
            this.curves[2].points[0]];
  }
}

