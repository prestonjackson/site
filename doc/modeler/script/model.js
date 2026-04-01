"use strict";

/**
 * Model class - contains geometric data (vertices, edges, faces) and render buffers.
 * Manages the data structures and GPU buffers for rendering.
 */
class Model {
  constructor(device) {
    this.device = device;

    // Geometric data
    this.vertices = [];  // Array of [x, y, z] coordinates
    this.edges = [];     // Array of [vertexIndex1, vertexIndex2] pairs
    this.faces = [];     // Array of [v1, v2, v3] triangle indices

    // GPU buffers
    this.vertexBuffer = null;
    this.edgeIndexBuffer = null;
    this.faceIndexBuffer = null;

    // Vertex counts for drawing
    this.vertexCount = 0;
    this.edgeCount = 0;
    this.faceCount = 0;

    // Camera for view/projection matrices
    this.camera = new Camera();

    // Dirty flag for render optimization
    this.dirty = true;

    // Reference to canvas for render requests
    this.canvas = null;
  }

  /**
   * Add a vertex to the model.
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {number} The index of the added vertex
   */
  addVertex(x, y, z) {
    const index = this.vertices.length / 3;
    this.vertices.push(x, y, z);
    return index;
  }

  /**
   * Add an edge between two vertices.
   * @param {number} v1 - First vertex index
   * @param {number} v2 - Second vertex index
   */
  addEdge(v1, v2) {
    this.edges.push(v1, v2);
  }

  /**
   * Add a triangular face.
   * @param {number} v1 - First vertex index
   * @param {number} v2 - Second vertex index
   * @param {number} v3 - Third vertex index
   */
  addFace(v1, v2, v3) {
    this.faces.push(v1, v2, v3);
  }

  /**
   * Upload the model data to GPU buffers.
   * Called before rendering.
   */
  uploadToGPU() {
    // Upload vertices
    if (this.vertices.length > 0) {
      const vertexData = new Float32Array(this.vertices);
      this.vertexBuffer = this.device.createBuffer({
        size: vertexData.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true,
      });
      new Float32Array(this.vertexBuffer.getMappedRange()).set(vertexData);
      this.vertexBuffer.unmap();
      this.vertexCount = this.vertices.length / 3;
    }

    // Upload edges as index buffer
    if (this.edges.length > 0) {
      const edgeData = new Uint32Array(this.edges);
      this.edgeIndexBuffer = this.device.createBuffer({
        size: edgeData.byteLength,
        usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true,
      });
      new Uint32Array(this.edgeIndexBuffer.getMappedRange()).set(edgeData);
      this.edgeIndexBuffer.unmap();
      this.edgeCount = this.edges.length / 2;
    }

    // Upload faces as index buffer
    if (this.faces.length > 0) {
      const faceData = new Uint32Array(this.faces);
      this.faceIndexBuffer = this.device.createBuffer({
        size: faceData.byteLength,
        usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true,
      });
      new Uint32Array(this.faceIndexBuffer.getMappedRange()).set(faceData);
      this.faceIndexBuffer.unmap();
      this.faceCount = this.faces.length / 3;
    }
  }

  /**
   * Clear all geometric data.
   */
  clear() {
    this.vertices = [];
    this.edges = [];
    this.faces = [];
    this.vertexCount = 0;
    this.edgeCount = 0;
    this.faceCount = 0;
  }

  /**
   * Get the camera
   */
  getCamera() {
    return this.camera;
  }
}
