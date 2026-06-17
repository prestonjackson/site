// @ts-check
"use strict";

import { Id } from "../util/id.js"
import { Mat4 } from "../math/mat4.js"
import { Point } from "../math/point.js"
import { Size2 } from "../math/size2.js";

export class Canvas {
  /** @typedef {GPUCanvasContext} */
  #context;
  /** @type {GPUAdapter?} */
  #adapter;
  /** @type {GPUDevice?} */
  #device;
  /** @type {GPURenderPipeline?} */
  #trianglePipeline;
  /** @type {GPURenderPipeline?} */
  #linePipeline;
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
  /** @type {GPUBuffer?} */
  #lineIndexBuffer;
  /** @type {number} */
  #lineIndexBufferSize = 0;
  /** @type {GPUBuffer?} */
  #triangleIndexBuffer;
  /** @type {number} */
  #triangleIndexBufferSize = 0;
  /** @type {GPUTexture?} */
  #depthTexture = null;
  /** @type {GPUTextureView?} */
  #depthTextureView = null;
  /** @type {Size2} */
  #size;
  /** @type {number} */
  #dpr = 1;

  /** 
   * @param {GPUCanvasContext} context
   * @param {Size2} size in pixels
   * @param {number} dpr device pixel ratio */
  constructor(context, size, dpr) {
    this.#context = context;
    this.#size = size;
    this.#dpr = dpr;

    this.#adapter = null;
    this.#device = null;
    this.#trianglePipeline = null;
    this.#linePipeline = null;
    this.#vertexBufferLayout = null;
    this.#uniformBuffer = null;
    this.#bindGroup = null;
    this.#frameRequested = false;

    this.#vertexBuffer = null;
    this.#lineIndexBuffer = null;
    this.#triangleIndexBuffer = null;
  }

  async initialize() {
    this.#adapter = await navigator.gpu.requestAdapter();
    if (!this.#adapter) {
      throw new Error("WebGPU adapter not available");
    }

    this.#device = await this.#adapter.requestDevice();
    if (!this.#device) {
      throw new Error("WebGPU device not available");
    }

    const format = navigator.gpu.getPreferredCanvasFormat();
    this.#context.configure({
      device: this.#device,
      format: format,
    });

    // Load shader from file
    const shaderResponse = await fetch("/modeler/script/gfx/triangle.wgsl");
    const shaderCode = await shaderResponse.text();

    const shaderModule = this.#device.createShaderModule({
      code: shaderCode,
    });

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

    this.#uniformBuffer = this.#device.createBuffer({
      size: 128,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const bindGroupLayout = this.#device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          buffer: { type: "uniform" },
        },
      ],
    });

    const pipelineLayout = this.#device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout],
    });

    this.#bindGroup = this.#device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: { buffer: this.#uniformBuffer },
        },
      ],
    });

    // Create depth-stencil state common to both pipelines
    /** @type {GPUDepthStencilState} */
    const depthStencilState = {
      depthWriteEnabled: true,
      depthCompare: "less",
      format: "depth24plus",
    };

    // Create Render Pipeline for Triangles (Faces)
    this.#trianglePipeline = this.#device.createRenderPipeline({
      layout: pipelineLayout,
      vertex: {
        module: shaderModule,
        entryPoint: "vs_main",
        buffers: [this.#vertexBufferLayout],
      },
      fragment: {
        module: shaderModule,
        entryPoint: "fs_main",
        targets: [{ format: format }],
      },
      primitive: {
        topology: "triangle-list",
      },
      depthStencil: depthStencilState,
    });

    // Create Render Pipeline for Lines (Edges/Grid)
    this.#linePipeline = this.#device.createRenderPipeline({
      layout: pipelineLayout,
      vertex: {
        module: shaderModule,
        entryPoint: "vs_main",
        buffers: [this.#vertexBufferLayout],
      },
      fragment: {
        module: shaderModule,
        entryPoint: "fs_main",
        targets: [{ format: format }],
      },
      primitive: {
        topology: "line-list",
      },
      depthStencil: depthStencilState,
    });

    this.recreateDepthTexture();
  }

  recreateDepthTexture() {
    if (!this.#device) return;

    if (this.#depthTexture) {
      this.#depthTexture.destroy();
    }

    const width = Math.max(1, Math.floor(this.#size.w * this.#dpr));
    const height = Math.max(1, Math.floor(this.#size.h * this.#dpr));

    this.#depthTexture = this.#device.createTexture({
      size: [width, height, 1],
      format: "depth24plus",
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    this.#depthTextureView = this.#depthTexture.createView();
  }

  get size() {
    return this.#size;
  }

  /** @param {Size2} size */
  set size(size) {
    this.#size = size;
    this.recreateDepthTexture();
  }

  get dpr() {
    return this.#dpr;
  }

  /** @param {number} dpr */
  set dpr(dpr) {
    this.#dpr = dpr;
    this.recreateDepthTexture();
  }

  /**
   * Main render function that draws the frame using multi-pass index drawing.
   * @param {number} timestamp
   * @param {Mat4} model
   * @param {Mat4} view
   * @param {Mat4} projection
   * @param {Map<any, Point>} points 
   * @param {Map<any, Array<any>>} lines
   * @param {Map<any, Array<any>>} polygons
   */
  renderFrame(timestamp,
              model, view, projection,
              points, lines, polygons) {
    if (!this.#device || !this.#uniformBuffer) return;

    // Update uniform buffer
    const uniformData = new Float32Array(32);
    for (let i = 0; i < 16; i++) {
      uniformData[i] = view.data[i];
      uniformData[16 + i] = projection.data[i];
    }
    this.#device.queue.writeBuffer(this.#uniformBuffer, 0, uniformData);

    // Map points to indices
    const pointData = [];
    const pointIdMap = new Map();
    let pointIndex = 0;
    for (const [id, point] of points) {
      // Use string representation of the ID to avoid object identity mismatch
      const idKey = typeof id === "object" && id !== null ? id.toString() : id;
      pointIdMap.set(idKey, pointIndex);
      pointData.push(point.x, point.y, point.z);
      pointIndex++;
    }

    if (pointData.length === 0) return;

    // Build line indices
    const lineIndexData = [];
    for (const [id, line] of lines) {
      const [v1, v2] = line;
      const v1Key = typeof v1 === "object" && v1 !== null ? v1.toString() : v1;
      const v2Key = typeof v2 === "object" && v2 !== null ? v2.toString() : v2;
      const idx1 = pointIdMap.get(v1Key);
      const idx2 = pointIdMap.get(v2Key);
      if (idx1 !== undefined && idx2 !== undefined) {
        lineIndexData.push(idx1, idx2);
      }
    }

    // Build polygon (triangle) indices
    const polygonIndexData = [];
    for (const [id, polygon] of polygons) {
      const [l1, l2, l3] = polygon;
      const l1Key = typeof l1 === "object" && l1 !== null ? l1.toString() : l1;
      const l2Key = typeof l2 === "object" && l2 !== null ? l2.toString() : l2;
      const l3Key = typeof l3 === "object" && l3 !== null ? l3.toString() : l3;

      const line1 = lines.get(l1Key);
      const line2 = lines.get(l2Key);
      const line3 = lines.get(l3Key);

      if (line1 && line2 && line3) {
        // Collect vertex indices from lines
        const v1Key = typeof line1[0] === "object" && line1[0] !== null ? line1[0].toString() : line1[0];
        const v2Key = typeof line2[0] === "object" && line2[0] !== null ? line2[0].toString() : line2[0];
        const v3Key = typeof line3[0] === "object" && line3[0] !== null ? line3[0].toString() : line3[0];

        const idx1 = pointIdMap.get(v1Key);
        const idx2 = pointIdMap.get(v2Key);
        const idx3 = pointIdMap.get(v3Key);

        if (idx1 !== undefined && idx2 !== undefined && idx3 !== undefined) {
          polygonIndexData.push(idx1, idx2, idx3);
        }
      }
    }

    // Upload Vertex Buffer
    const vertexData = new Float32Array(pointData);
    const vertexByteLength = vertexData.byteLength;
    if (!this.#vertexBuffer || this.#vertexBufferSize < vertexByteLength) {
      if (this.#vertexBuffer) this.#vertexBuffer.destroy();
      this.#vertexBufferSize = Math.max(vertexByteLength, 1024);
      this.#vertexBuffer = this.#device.createBuffer({
        size: this.#vertexBufferSize,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      });
    }
    this.#device.queue.writeBuffer(this.#vertexBuffer, 0, vertexData);

    // Upload Line Index Buffer
    let hasLines = lineIndexData.length > 0;
    if (hasLines) {
      const lineIndices = new Uint32Array(lineIndexData);
      const lineIndexByteLength = lineIndices.byteLength;
      if (!this.#lineIndexBuffer || this.#lineIndexBufferSize < lineIndexByteLength) {
        if (this.#lineIndexBuffer) this.#lineIndexBuffer.destroy();
        this.#lineIndexBufferSize = Math.max(lineIndexByteLength, 512);
        this.#lineIndexBuffer = this.#device.createBuffer({
          size: this.#lineIndexBufferSize,
          usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
        });
      }
      this.#device.queue.writeBuffer(this.#lineIndexBuffer, 0, lineIndices);
    }

    // Upload Triangle Index Buffer
    let hasTriangles = polygonIndexData.length > 0;
    if (hasTriangles) {
      const triangleIndices = new Uint32Array(polygonIndexData);
      const triangleIndexByteLength = triangleIndices.byteLength;
      if (!this.#triangleIndexBuffer || this.#triangleIndexBufferSize < triangleIndexByteLength) {
        if (this.#triangleIndexBuffer) this.#triangleIndexBuffer.destroy();
        this.#triangleIndexBufferSize = Math.max(triangleIndexByteLength, 512);
        this.#triangleIndexBuffer = this.#device.createBuffer({
          size: this.#triangleIndexBufferSize,
          usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
        });
      }
      this.#device.queue.writeBuffer(this.#triangleIndexBuffer, 0, triangleIndices);
    }

    const commandEncoder = this.#device.createCommandEncoder();
    const textureView = this.#context.getCurrentTexture().createView();

    /** @type {GPURenderPassDescriptor} */
    const renderPassDesc = {
      colorAttachments: [
        {
          view: textureView,
          clearValue: { r: 0.95, g: 0.95, b: 0.95, a: 1.0 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    };

    if (this.#depthTextureView) {
      renderPassDesc.depthStencilAttachment = {
        view: this.#depthTextureView,
        depthClearValue: 1.0,
        depthLoadOp: "clear",
        depthStoreOp: "store",
      };
    }

    const renderPass = commandEncoder.beginRenderPass(renderPassDesc);
    renderPass.setVertexBuffer(0, this.#vertexBuffer);
    if (this.#bindGroup) {
      renderPass.setBindGroup(0, this.#bindGroup);
    }

    // Pass 1: Render Lines (Grid & Edges)
    if (hasLines && this.#linePipeline && this.#lineIndexBuffer) {
      renderPass.setPipeline(this.#linePipeline);
      renderPass.setIndexBuffer(this.#lineIndexBuffer, "uint32");
      renderPass.drawIndexed(lineIndexData.length);
    }

    // Pass 2: Render Triangles (Faces)
    if (hasTriangles && this.#trianglePipeline && this.#triangleIndexBuffer) {
      renderPass.setPipeline(this.#trianglePipeline);
      renderPass.setIndexBuffer(this.#triangleIndexBuffer, "uint32");
      renderPass.drawIndexed(polygonIndexData.length);
    }

    renderPass.end();
    this.#device.queue.submit([commandEncoder.finish()]);
  }
}
