// @ts-check
"use strict";

import { Curve } from "../math/curve.js";
import { Surface } from "../math/surface.js";
import { Point } from "./point.js";
import { Id } from "../util/id.js";

/**
 * Geometry - Represents a structured set of vertices (points), edges (lines), and faces (polygons).
 */
export class Geometry {
  /** @type {Map<Id, Point>} */
  points;
  /** @type {Map<Id, Curve>} */
  curves;
  /** @type {Map<Id, Surface>} */
  surfaces;

  /** @type {number} */
  kPointStride = 3;  // x, y, z
  /** @type {number} */
  kLineStride = 2;   // two point indices per line
  /** @type {number} */
  kTriangleStride = 3; // three point indices per triangle

  constructor() {
    this.points = new Map();
    this.curves = new Map();
    this.surfaces = new Map();
  }

  /**
   * Union another geometry into this one.
   * @param {Geometry} other - The other geometry to union.
   */
  union(other) {
    for (const [id, point] of other.points) {
      this.points.set(id, point);
    }
    for (const [id, curve] of other.curves) {
      this.curves.set(id, curve);
    }
    for (const [id, surface] of other.surfaces) {
      this.surfaces.set(id, surface);
    }
  }

  /**
   * Pack the geometry into a compact representation suitable for GPU buffers.
   * @returns {{pointData: Float32Array,
   *            pointIndices: Uint32Array,
   *            lineIndices: Uint32Array,
   *            triangleIndices: Uint32Array}} - The packed data.
   */
  pack() {
    // Create an array of point data, and a mapping from point IDs to their
    // indices in the array
    const pointData = new Float32Array(this.points.size * this.kPointStride);
    const pointIdToIndexMap = new Map();
    let pointIndex = 0;
    for (const [id, point] of this.points) {
      pointIdToIndexMap.set(id.toNumber(), pointIndex);
      
      const dataOffset = pointIndex * this.kPointStride;
      pointData[dataOffset] = point.x;
      pointData[dataOffset + 1] = point.y;
      pointData[dataOffset + 2] = point.z;
      pointIndex += 1;
    }

    // Create an array of point indices for points.
    const pointIndices = new Uint32Array(this.points.size);
    let i = 0;
    for (const [id, _] of this.points) {
      pointIndices[i] = pointIdToIndexMap.get(id.toNumber());
      i++;
    }

    // Tesselate curves into lines.
    const linePointIds = [];
    for (const [_, curve] of this.curves) {
      const lines = curve.tesselate();
      linePointIds.push(...lines);
    }

    // Pack line data into a flat array of indices.
    const lineIndices = new Uint32Array(linePointIds.length);
    for (let i = 0; i < linePointIds.length; i++) {
      const id = linePointIds[i];
      lineIndices[i] = pointIdToIndexMap.get(id.toNumber());
    }

    // Tesselate surfaces into triangles.
    const trianglePointIds = [];
    for (const [_, surface] of this.surfaces) {
      const triangles = surface.tesselate();
      trianglePointIds.push(...triangles);
    }

    // Pack triangle data into a flat array of indices.
    const triangleIndices = new Uint32Array(trianglePointIds.length);
    for (let i = 0; i < trianglePointIds.length; i++) {
      const id = trianglePointIds[i];
      triangleIndices[i] = pointIdToIndexMap.get(id.toNumber());
    }

    return {
      pointData: pointData,
      pointIndices: pointIndices,
      lineIndices: lineIndices,
      triangleIndices: triangleIndices
    };                                                                         
  }
}
