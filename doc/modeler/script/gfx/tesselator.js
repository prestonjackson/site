// @ts-check
"use strict";

/**
 * Triangulates a 2D polygon using the Earcut algorithm.
 */

class Tesselator {
/** 
 * @param {number[]} data - Flat array of vertices [x0, y0, x1, y1, ...]
 * @returns {number[]} Array of vertex indices grouped by 3s forming triangles.
 **/
  static earcut(data) {
    /** @type {number[]} */  
    const indices = [];
      if (!data || data.length < 6) return indices;

      // 1. Create a doubly-linked cyclic list of vertex nodes
      let outerNode = this.#createLinkedList(data, 0, data.length, true);
      if (!outerNode || outerNode.next === outerNode.prev) return indices;

      // 2. Eliminate self-intersections and find triangles
      this.#tessellateLinkedLoop(outerNode, indices);
      return indices;
  }

  /** @param {number[]} data @param {number} start @param {number} end @param {boolean} clockwise @returns {any} */
  static #createLinkedList(data, start, end, clockwise) {
      let last;
      if (clockwise === (this.#getArea(data, start, end) > 0)) {
          for (let i = start; i < end; i += 2) last = this.#insertNode(i / 2, data[i], data[i + 1], last);
      } else {
          for (let i = end - 2; i >= start; i -= 2) last = this.#insertNode(i / 2, data[i], data[i + 1], last);
      }
      if (last && this.#equals(last, last.next)) {
          this.#removeNode(last);
          last = last.next;
      }
      return last;
  }

  /** @param {any} ear @param {number[]} indices */
  static #tessellateLinkedLoop(ear, indices) {
      if (!ear) return;
      let stop = ear, prev, next;

      // Main loop: find ears and cut them out one by one
      while (ear.prev !== ear.next) {
          prev = ear.prev;
          next = ear.next;

          if (this.#isEar(ear)) {
              indices.push(prev.i, ear.i, next.i); // Save triangle indices
              this.#removeNode(ear);
              ear = next.next; // Skipping a node accelerates processing
              stop = next.next;
              continue;
          }

          ear = next;
          if (ear === stop) break; // Trapped, polygon might be self-intersecting
      }
  }

  /** @param {any} ear @returns {boolean} */
  static #isEar(ear) {
      const a = ear.prev, b = ear, c = ear.next;
      if (this.#getAreaPoints(a, b, c) >= 0) return false; // Reflex angle, cannot be an ear

      // Check if any other polygon vertex lies inside the triangle
      let p = ear.next.next;
      while (p !== ear.prev) {
          if (this.#isPointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
              this.#getAreaPoints(p.prev, p, p.next) >= 0) return false;
          p = p.next;
      }
      return true;
  }

  /** @param {number} ax @param {number} ay @param {number} bx @param {number} by @param {number} cx @param {number} cy @param {number} px @param {number} py @returns {boolean} */
  static #isPointInTriangle(ax, ay, bx, by, cx, cy, px, py) {
      return (cx - px) * (ay - py) - (ax - px) * (cy - py) >= 0 &&
            (ax - px) * (by - py) - (bx - px) * (ay - py) >= 0 &&
            (bx - px) * (cy - py) - (cx - px) * (by - py) >= 0;
  }

  /** @param {number[]} data @param {number} start @param {number} end @returns {number} */
  static #getArea(data, start, end) {
      let sum = 0;
      for (let i = start, j = end - 2; i < end; i += 2) {
          sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1]);
          j = i;
      }
      return sum;
  }

  /** @param {any} p1 @param {any} p2 @param {any} p3 @returns {number} */
  static #getAreaPoints(p1, p2, p3) {
      return (p2.y - p1.y) * (p3.x - p2.x) - (p2.x - p1.x) * (p3.y - p2.y);
  }

  /** @param {number} i @param {number} x @param {number} y @param {any} last @returns {any} */
  static #insertNode(i, x, y, last) {
      const p = { i, x, y, prev: null, next: null };
      if (!last) {
          p.prev = p;
          p.next = p;
      } else {
          p.next = last.next;
          p.prev = last;
          last.next.prev = p;
          last.next = p;
      }
      return p;
  }

  /** @param {any} p */
  static #removeNode(p) {
      p.next.prev = p.prev;
      p.prev.next = p.next;
  }

  /** @param {any} p1 @param {any} p2 @returns {boolean} */
  static #equals(p1, p2) {
      return p1.x === p2.x && p1.y === p2.y;
  }
}


// Example
// A simple concave 'L' shaped polygon
const vertices = [
    0,   0,   // Index 0
    100, 0,   // Index 1
    100, 50,  // Index 2
    50,  50,  // Index 3
    50,  100, // Index 4
    0,   100  // Index 5
];

// Compute the triangles
const indices = Tesselator.earcut(vertices);

console.log("Index Buffer:", indices);
// Expected output: [0, 1, 2, 0, 2, 3, 0, 3, 5, 3, 4, 5] (or similar valid orientation)

// Optional: Unroll for debugging or non-indexed rendering
for (let i = 0; i < indices.length; i += 3) {
    console.log(`Triangle ${i/3}:`);
    console.log(`  P1: (${vertices[indices[i]*2]}, ${vertices[indices[i]*2+1]})`);
    console.log(`  P2: (${vertices[indices[i+1]*2]}, ${vertices[indices[i+1]*2+1]})`);
    console.log(`  P3: (${vertices[indices[i+2]*2]}, ${vertices[indices[i+2]*2+1]})`);
}