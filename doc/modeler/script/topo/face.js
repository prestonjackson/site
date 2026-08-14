// @ts-check
"use strict";

import { Surface } from "../math/surface.js";
import { Edge } from "./edge.js";
import { Id } from "../util/id.js";

/*
 * Face - represents a polygonal face bounded by edges.
 * Minimum three edges are required to form a face.
 */
export class Face {
  /** @type {Id} */
  #id;
  /** @type {Array<Edge>} */
  #edges;
  /** @type {Surface} */
  #surface;

  /**
   * @param {Array<Edge>} edges
   */
  constructor(edges) {
    if (edges.length < 3) {
      throw new Error("Face requires an array of at least 3 edges");
    }
    this.#id = new Id();
    this.#edges = [...edges];  // Copy the array.
    
    const curves = this.#edges.map(edge => edge.curve);
    this.#surface = new Surface(curves, []);
  }

  /**
   * Get the edges of this face.
   * @returns {Array<Id>}
   */
  get edgeIds() {
    const ids = this.#edges.map(edge => edge.id);
    return [...ids];  // Return a copy of the array.
  }

  /** Set the edges of this face.
   * @param {Array<Edge>} edges
   */
  set edgeIds(edges) {
    this.#edges = [...edges];  // Copy the array.
  }

  /**
   * Get ths surface representation
   * @returns {Surface}
   */
  get surface() {
    return this.#surface;
  }
  /**
   * @returns {Id}
   */
  get id() {
    return this.#id;
  }

  /**
   * @param {Id} value
   */
  set id(value) {
    this.#id = value;
  }
}
