// @ts-check
"use strict";

import { Point } from "../math/point.js";
import { Geometry } from "../math/geometry.js";
import { Id } from "../util/id.js"; 

class GeometryPacker {
  /** @param {Geometry} geometry **/
  static pack(geometry) {
    const pointData = [];
    const pointIdIndexMap = new Map();
    let pointIndex = 0;

    for (const [id, point] of geometry.points) {
      pointIdIndexMap.set(id.toIndex(), pointIndex++);
      pointData.push(point.x, point.y, point.z);
    }

    const lineIndices = [];
    for (const [id, line] of geometry.lines) {
      const [v1, v2] = line;
      const idx1 = pointIdIndexMap.get(v1.toIndex());
      const idx2 = pointIdIndexMap.get(v2.toIndex());

      lineIndices.push(idx1, idx2);
    }

    const triangleIndices = [];
    for (const [id, polygon] of geometry.polygons) {
      const triangles = tesselate(polygon);

      const [l1, l2, l3] = polygon;
      const line1 = geometry.lines.get(l1.toIndex());
      const line2 = geometry.lines.get(l2.toIndex());
      const line3 = geometry.lines.get(l3.toIndex());

      if (line1 && line2 && line3) {
        const idx1 = pointIdIndexMap.get(line1[0].toIndex());
        const idx2 = pointIdIndexMap.get(line2[0].toIndex());
        const idx3 = pointIdIndexMap.get(line3[0].toIndex());
        
        triangleIndices.push(idx1, idx2, idx3);
      }
    }

    return {
      vertices: new Float32Array(pointData),
      lines: new Uint32Array(lineIndices),
      triangles: new Uint32Array(triangleIndices)
    };                                                                                         
  }
  /** @param {Array<Id>} polygon @returns  *//
  tesselate(polygon) {

  }
}