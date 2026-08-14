// @ts-check
"use strict";

import { Point } from "./point.js";

// This curve class represents a 3D curve defined by a set of control points.
// It provides methods to export to lines for rendering. For now, we support
// only straight segments between endpoints, making the conversion to lines
// simple for drawing.
// 
// FUTURE, add support for more complex curves such as Beziers and NURBS.  

export class Curve {
  /** @type {Array<Point>} Boundary points (endpoints) */
  #points;
  /** @type {Array<Point>} Control points */
  #controls;

  /** @param {Array<Point>} points @param {Array<Point>} controls */
  constructor(points, controls) {
    this.#points = [...points];
    this.#controls = [...controls];
  }

  /**
   * Get the boundary points defining the endpoints curve.
   * @returns {Array<Point>} The array of points.
   */
  get points() {
    return this.#points;
  }

  /**
   * Get the control points for the curve.
   * @returns {Array<Point>} The array of control points.
   */
  get controls() {
    return this.#controls;
  }

  /** @returns {Array<Point>} */
  tesselate() {
    return [this.points[0], this.points[1]]; // Simple line segment for now
  }
}
