// @ts-check
"use strict";

import { Geometry } from "../math/geometry.js";
import { Mat4 } from "../math/mat4.js"
import { Point } from "../math/point.js"
import { Size2 } from "../math/size2.js";
import { ClearStage } from "./stages/clear_stage.js";
import { GridStage } from "./stages/grid_stage.js";
import { LineStage } from "./stages/line_stage.js";
import { PointStage } from "./stages/point_stage.js";
import { TriangleStage } from "./stages/triangle_stage.js";

export class Canvas {
  /** @typedef {GPUCanvasContext} */
  #context;
  /** @type {GPUAdapter?} */
  #adapter;
  /** @type {GPUDevice?} */
  #device;
  /** @type {TriangleStage?} */
  #faceStage;
  /** @type {LineStage?} */
  #lineStage;
  /** @type {PointStage?} */
  #pointStage;
  /** @type {GridStage?} */
  #gridStage;
  /** @type {ClearStage?} */
  #clearStage;
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
    this.#faceStage = null;
    this.#lineStage = null;
    this.#pointStage = null;
    this.#gridStage = null;
    this.#clearStage = null;
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
    
    // Set up the context configuration with the preferred format.
    this.#context.configure({
      device: this.#device,
      format: format,
      alphaMode: "opaque",
    });

    // Load shader from file
    const shaderResponse = await fetch("/modeler/script/gfx/shaders.wgsl");
    const shaderCode = await shaderResponse.text();

    const shaderModule = this.#device.createShaderModule({
      code: shaderCode,
    });

    // Set up vertex buffer layout for 3D positions (x, y, z)
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

    // Set up uniforms and a BindGroup for the view and projection matrices.
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

    this.#clearStage = new ClearStage();
    
    this.#gridStage = new GridStage(
      this.#device,
      pipelineLayout,
      this.#vertexBufferLayout,
      shaderModule,
      format,
      depthStencilState
    );

    this.#lineStage = new LineStage(
      this.#device,
      pipelineLayout,
      this.#vertexBufferLayout,
      shaderModule,
      format,
      depthStencilState
    );

    this.#pointStage = new PointStage(
      this.#device,
      pipelineLayout,
      this.#vertexBufferLayout,
      shaderModule,
      format,
      depthStencilState
    );

    this.#faceStage = new TriangleStage(
      this.#device,
      pipelineLayout,
      this.#vertexBufferLayout,
      shaderModule,
      format,
      depthStencilState
    );

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
   * @param {Geometry} geometry 
   */
  renderFrame(timestamp,
              model, view, projection,
              geometry) {
    if (!this.#device || !this.#uniformBuffer) return;

    // Update uniform buffer for the view and projection matrices
    const uniformData = new Float32Array(32);
    for (let i = 0; i < 16; i++) {
      uniformData[i] = view.data[i];
      uniformData[16 + i] = projection.data[i];
    }
    this.#device.queue.writeBuffer(this.#uniformBuffer, 0, uniformData);

    // Map points to a sequential set of indices
    const pointData = [];
    const pointIdMap = new Map();
    let pointIndex = 0;
    for (const [id, point] of geometry.points) {
      // Use string representation of the ID to avoid object identity mismatch
      const idKey = id.toString();
      pointIdMap.set(idKey, pointIndex);
      pointData.push(point.x, point.y, point.z);
      pointIndex++;
    }

    if (pointData.length === 0) return;

    // Build line indices
    const lineIndexData = [];
    for (const [_, line] of geometry.lines) {
      const [v1, v2] = line;

      const v1Key = v1.toString();
      const v2Key = v2.toString();

      const idx1 = pointIdMap.get(v1Key);
      const idx2 = pointIdMap.get(v2Key);

      lineIndexData.push(idx1, idx2);
    }

    // Build polygon (triangle) indices
    const polygonIndexData = [];
    for (const [_, polygon] of geometry.polygons) {
      const [l1, l2, l3] = polygon;

      const l1Key = l1.toString();
      const l2Key = l2.toString();
      const l3Key = l3.toString();

      const line1 = pointIdMap.get(l1Key);
      const line2 = pointIdMap.get(l2Key);
      const line3 = pointIdMap.get(l3Key);

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

    const renderPassDesc =
      this.#clearStage?.createRenderPassDescriptor(
        textureView,
        this.#depthTextureView
      );

    const renderPass = commandEncoder.beginRenderPass(renderPassDesc);
    renderPass.setVertexBuffer(0, this.#vertexBuffer);
    if (this.#bindGroup) {
      renderPass.setBindGroup(0, this.#bindGroup);
    }

    if (hasLines && this.#lineStage && this.#lineIndexBuffer) {
      this.#lineStage.render(renderPass, this.#lineIndexBuffer, lineIndexData.length);
    }

    if (hasTriangles && this.#faceStage && this.#triangleIndexBuffer) {
      this.#faceStage.render(
        renderPass,
        this.#triangleIndexBuffer,
        polygonIndexData.length
      );
    }

    renderPass.end();
    this.#device.queue.submit([commandEncoder.finish()]);
  }
}
