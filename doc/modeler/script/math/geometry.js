// @ts-check
"use strict";

import { Point } from "./point.js";
import { Id } from "../util/id.js";


/**
 * Geometry - Represents a structured set of vertices (points), edges (lines), and faces (polygons).
 */
export class Geometry {
  /** @type {Map<Id, Point>} */
  points;
  /** @type {Map<Id, Array<Id>>} */
  lines;
  /** @type {Map<Id, Array<Id>>} */
  polygons;

  constructor() {
    this.points = new Map();
    this.lines = new Map();
    this.polygons = new Map();
  }

  /**
   * Union another geometry into this one.
   * @param {Geometry} other - The other geometry to union.
   */
  union(other) {
    for (const [id, point] of other.points) {
      this.points.set(id, point);
    }
    for (const [id, line] of other.lines) {
      this.lines.set(id, line);
    }
    for (const [id, polygon] of other.polygons) {
      this.polygons.set(id, polygon);
    }
  }
}
