// @ts-check

/** @import { Mat4 } from "../math/mat4.js" */
/** @import { Vertex } from "../topo/vertex.js" */
/** @import { Edge } from "../topo/edge.js" */
/** @import { Face } from "../topo/face.js" */

export class Canvas {
  /** @type {GPUCanvasContext} */
  #context;
  /** @type {GPUAdapter?} */
  #adapter;
  /** @type {GPUDevice?} */
  #device;
  /** @type {GPURenderPipeline?} */
  #renderPipeline;
  /** @type {GPUVertexBufferLayout?} */
  #vertexBufferLayout;
  /** @type {GPUBuffer?} */
  #uniformBuffer;
  /** @type {GPUBindGroup?} */
  #bindGroup;
  /** @type {boolean} */
  #frameRequested;
  /** @type {GPUBuffer?} */
  #vertexBuffer;
  /** @type {number} */
  #vertexBufferSize = 0;

  constructor(context) {
    // The webgpu context from the canvas element.
    this.#context = context;

    this.#adapter = null;
    this.#device = null;
    this.#renderPipeline = null;
    this.#vertexBufferLayout = null;
    this.#uniformBuffer = null;
    this.#bindGroup = null;
    this.#frameRequested = false;

    this.#vertexBuffer = null;
  }

  async initialize() {
    // Get WebGPU adapter (which reprents the GPU).
    this.#adapter = await navigator.gpu.requestAdapter();
    if (!this.#adapter) {
      throw new Error("WebGPU adapter not available");
    }

    // Get device from adapter (represents a connection to the GPU).
    this.#device = await this.#adapter.requestDevice();
    if (!this.#device) {
      throw new Error("WebGPU device not available");
    }

    // Configure context with device and preferred format. The format
    // determines how colors are stored in the canvas texture.
    const format = navigator.gpu.getPreferredCanvasFormat();
    this.#context.configure({
      device: this.#device,
      format: format,
    });

    // Load shader from file
    const shaderResponse = await fetch("/modeler/script/gfx/triangle.wgsl");
    const shaderCode = await shaderResponse.text();

    // Create shader module
    const shaderModule = this.#device.createShaderModule({
      code: shaderCode,
    });

    // Define vertex buffer layout
    this.#vertexBufferLayout = {
      arrayStride: 12, // 3 floats * 4 bytes
      attributes: [
        {
          shaderLocation: 0,
          offset: 0,
          format: "float32x3",
        },
      ],
    };

    // Create uniform buffer for view/projection matrices
    // 2 matrices = 8 float4s = 32 floats = 128 bytes
    this.#uniformBuffer = this.#device.createBuffer({
      size: 128,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // Create bind group layout, which describes the resources
    // (buffers, textures) that will be bound to the shader.
    const bindGroupLayout = this.#device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          buffer: { type: "uniform" },
        },
      ],
    });

    // Create pipeline layout with bind group
    const pipelineLayout = this.#device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout],
    });

    // Create bind group
    this.#bindGroup = this.#device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: { buffer: this.#uniformBuffer },
        },
      ],
    });

    // Create render pipeline
    this.#renderPipeline = this.#device.createRenderPipeline({
      layout: pipelineLayout,
      vertex: {
        module: shaderModule,
        entryPoint: "vs_main",
        buffers: [this.#vertexBufferLayout],
      },
      fragment: {
        module: shaderModule,
        entryPoint: "fs_main",
        targets: [
          {
            format: format,
          },
        ],
      },
      primitive: {
        topology: "triangle-list",
      },
    });
  }

  /**
   * Main render function that draws the frame.
   * @param {number} timestamp
   * @param {Mat4} modelMatrix
   * @param {Mat4} viewMatrix
   * @param {Mat4} projectionMatrix
   * @param {Map<import("../util/id.js").Id, Vertex>} vertices 
   * @param {Map<import("../util/id.js").Id, Edge>} edges
   * @param {Map<import("../util/id.js").Id, Face>} faces
   */
  drawFrame(timestamp, modelMatrix, viewMatrix, projectionMatrix, vertices, edges, faces) {
    if (!this.#device) return;

    // Update uniform buffer
    const uniformData = new Float32Array(32);
    for (let i = 0; i < 16; i++) {
      uniformData[i] = viewMatrix.data[i];
      uniformData[16 + i] = projectionMatrix.data[i];
    }
    this.#device.queue.writeBuffer(this.#uniformBuffer, 0, uniformData);

    // Flatten vertices into a buffer
    const triangleVertices = [];
    if (faces) {
      for (const face of faces.values()) {
        const vIds = new Set();
        face.edges.forEach(edge => {
          vIds.add(edge.v1);
          vIds.add(edge.v2);
        });

        const vertexArray = Array.from(vIds).map(id => vertices.get(id));
        if (vertexArray.length >= 3) {
          for (let i = 0; i < 3; i++) {
            triangleVertices.push(vertexArray[i].point.x, vertexArray[i].point.y, vertexArray[i].point.z);
          }
        }
      }
    }

    if (triangleVertices.length === 0) return;

    const data = new Float32Array(triangleVertices);
    const byteLength = data.byteLength;

    // Reallocate vertex buffer if needed (if it doesn't exist or is too small)
    if (!this.#vertexBuffer || this.#vertexBufferSize < byteLength) {
      if (this.#vertexBuffer) this.#vertexBuffer.destroy();

      this.#vertexBufferSize = Math.max(byteLength, 1024); // Minimum size or exact
      this.#vertexBuffer = this.#device.createBuffer({
        size: this.#vertexBufferSize,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      });
    }

    // Write data to the existing buffer
    this.#device.queue.writeBuffer(this.#vertexBuffer, 0, data);

    const commandEncoder = this.#device.createCommandEncoder();
    const textureView = this.#context.getCurrentTexture().createView();

    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: textureView,
          clearValue: { r: 0.95, g: 0.95, b: 0.95, a: 1.0 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });

    renderPass.setPipeline(this.#renderPipeline);
    renderPass.setVertexBuffer(0, this.#vertexBuffer);

    if (this.#bindGroup) {
      renderPass.setBindGroup(0, this.#bindGroup);
    }

    renderPass.draw(triangleVertices.length / 3);

    renderPass.end();
    this.#device.queue.submit([commandEncoder.finish()]);
  }
}
