// @ts-check
"use strict";

import { Curve } from "./curve.js";
import { Point } from "./point.js";
import { Surface } from "./surface.js";

/**
 * Geometry - Represents a structured set of vertices (points), edges (lines), and faces (polygons).
 */
export class Geometry {
  /** @type {Map<number, Point>} */
  points;
  /** @type {Map<number, Curve>} */
  curves;
  /** @type {Map<number, Surface>} */
  surfaces;

  /** @type {number} */
  kPointStride = 3;  // x, y, z
  /** @type {number} */
  kLineStride = 2;   // two point indices per line
  /** @type {number} */
  kTriangleStride = 3; // three point indices per triangle

  /**
   * @param {Map<number, Point>} points
   * @param {Map<number, Curve>} curves
   * @param {Map<number, Surface>} surfaces
   */
  constructor(points = new Map(), curves = new Map(), surfaces = new Map()) {
    this.points = points;
    this.curves = curves;
    this.surfaces = surfaces;
  }

  /**
   * Union another geometry into this one.
   * @param {Geometry} other - The other geometry to union.
   */
  union(other) {
    for (const [key, point] of other.points) {
      this.points.set(key, point);
    }
    for (const [key, curve] of other.curves) {
      this.curves.set(key, curve);
    }
    for (const [key, surface] of other.surfaces) {
      this.surfaces.set(key, surface);
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
    
    // Map from a point references to a vertex-id (the key)
    const pointRefToVertexIdMap = new Map();
    // Map from the vertex-id to the an index in the point array
    const vertexIdToPointIndexMap = new Map();
    let pointIndex = 0;
    for (const [id, point] of this.points) {
      pointRefToVertexIdMap.set(point, id);
      vertexIdToPointIndexMap.set(id, pointIndex);

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
      pointIndices[i] = vertexIdToPointIndexMap.get(id);
      i++;
    }

    // Tesselate curves into lines.
    const lineVertexIds = [];
    for (const [_, curve] of this.curves) {
      const linePointRefs = curve.tesselate();
      for (const pointRef of linePointRefs) {
        // Look up the vertex ID for the point ref of the tesselated line.
        const vertexId = pointRefToVertexIdMap.get(pointRef);
        lineVertexIds.push(vertexId);
      }
    }
    
    // Pack triangle data into a flat array of indices.
    const lineIndices = new Uint32Array(lineVertexIds.length);
    for (let i = 0; i < lineVertexIds.length; i++) {
      lineIndices[i] = vertexIdToPointIndexMap.get(lineVertexIds[i]);
    }

    // Tesselate surfaces into triangles and collect the vertex IDs..
    const triangleVertexIds = [];
    for (const [_, surface] of this.surfaces) {
      const surfacePointRefs = surface.tesselate();
      for (const pointRef of surfacePointRefs) {
        // Look up the vertex ID for the point ref of the tesselated surface.
        const vertexId = pointRefToVertexIdMap.get(pointRef);
        triangleVertexIds.push(vertexId);
      }
    }

    // Pack triangle data into a flat array of indices.
    const triangleIndices = new Uint32Array(triangleVertexIds.length);
    for (let i = 0; i < triangleVertexIds.length; i++) {
      triangleIndices[i] = vertexIdToPointIndexMap.get(triangleVertexIds[i]);
    }

    return {
      pointData: pointData,
      pointIndices: pointIndices,
      lineIndices: lineIndices,
      triangleIndices: triangleIndices
    };                                                                         
  }
}
