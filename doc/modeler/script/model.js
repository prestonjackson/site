"use strict";

/**
 * Model class - contains persistent data including topology, camera, and render buffers.
 * Separates geometric structure from rendering and tool interaction state.
 */
class Model {
  constructor(device) {
    this.device = device;

    // Topological data (geometric structure)
    this.topology = new Topology();

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

    // Reference to canvas for render requests
    this.canvas = null;
  }

  /**
   * Add a vertex to the model (delegates to topology).
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {number} The index of the added vertex
   */
  addVertex(x, y, z) {
    return this.topology.addVertex(x, y, z);
  }

  /**
   * Add an edge between two vertices (delegates to topology).
   * @param {number} v1 - First vertex index
   * @param {number} v2 - Second vertex index
   */
  addEdge(v1, v2) {
    this.topology.addEdge(v1, v2);
  }

  /**
   * Add a triangular face (delegates to topology).
   * @param {number} v1 - First vertex index
   * @param {number} v2 - Second vertex index
   * @param {number} v3 - Third vertex index
   */
  addFace(v1, v2, v3) {
    this.topology.addFace(v1, v2, v3);
  }

  /**
   * Upload the model data to GPU buffers.
   * Called before rendering.
   * Uploads topology data to GPU buffers.
   * Called before rendering.
   */
  uploadToGPU() {
    // Upload vertices
    if (this.topology.vertices.length > 0) {
      const vertexData = new Float32Array(this.topology.vertices);
      this.vertexBuffer = this.device.createBuffer({
        size: vertexData.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true,
      });
      new Float32Array(this.vertexBuffer.getMappedRange()).set(vertexData);
      this.vertexBuffer.unmap();
      this.vertexCount = this.topology.vertices.length / 3;
    }

    // Upload edges as index buffer
    if (this.topology.edges.length > 0) {
      const edgeData = new Uint32Array(this.topology.edges);
      this.edgeIndexBuffer = this.device.createBuffer({
        size: edgeData.byteLength,
        usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true,
      });
      new Uint32Array(this.edgeIndexBuffer.getMappedRange()).set(edgeData);
      this.edgeIndexBuffer.unmap();
      this.edgeCount = this.topology.edges.length / 2;
    }

    // Upload faces as index buffer
    if (this.topology.faces.length > 0) {
      const faceData = new Uint32Array(this.topology.faces);
      this.faceIndexBuffer = this.device.createBuffer({
        size: faceData.byteLength,
        usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true,
      });
      new Uint32Array(this.faceIndexBuffer.getMappedRange()).set(faceData);
      this.faceIndexBuffer.unmap();
      this.faceCount = this.topology
    }
  }

  /**
   * Clear all geometric data.
   */
  clear() {
    this.topology.clear();
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
