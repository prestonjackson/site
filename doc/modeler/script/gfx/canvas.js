// @ts-check
"use strict";

import { Color } from "../math/color.js"
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
  #triangleStage;
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
  #pointIndexBuffer;
  /** @type {number} */
  #pointIndexBufferSize = 0;
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
    this.#triangleStage = null;
    this.#lineStage = null;
    this.#pointStage = null;
    this.#gridStage = null;
    this.#clearStage = null;
    this.#vertexBufferLayout = null;
    this.#uniformBuffer = null;
    this.#bindGroup = null;
    this.#frameRequested = false;

    this.#vertexBuffer = null;
    this.#pointIndexBuffer = null;
    this.#lineIndexBuffer = null;
    this.#triangleIndexBuffer = null;
  }

  async initialize() {
    // Initialize the WebGPU interface.
    this.#adapter = await navigator.gpu.requestAdapter();
    if (!this.#adapter) {
      throw new Error("WebGPU adapter not available (Physical GPU and Driver)");
    }

    this.#device = await this.#adapter.requestDevice();
    if (!this.#device) {
      throw new Error("WebGPU device not available (App-specific GPU Session)");
    }
    
    // Set up the context configuration with the preferred format.
    const format = navigator.gpu.getPreferredCanvasFormat();
    this.#context.configure({
      device: this.#device,
      format: format,
      alphaMode: "opaque",
    });

    // Load the WGSL shaders from file, compile them into a shader module.
    const shaderResponse = await fetch("/modeler/script/gfx/shaders.wgsl");
    const shaderCode = await shaderResponse.text();
    const shaderModule = this.#device.createShaderModule({
      code: shaderCode,
    });

    // Set up vertex buffer layout for 3D positions (x, y, z).
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

    const kBackgroundColor = new Color(238/255, 246/255, 248/255, 1.0);

    this.#clearStage = new ClearStage(kBackgroundColor);
    
    this.#pointStage = new PointStage(
      this.#device,
      pipelineLayout,
      this.#vertexBufferLayout,
      shaderModule,
      format,
      depthStencilState
    );

    // this.#gridStage = new GridStage(
    //   this.#device,
    //   pipelineLayout,
    //   this.#vertexBufferLayout,
    //   shaderModule,
    //   format,
    //   depthStencilState
    // );

    this.#lineStage = new LineStage(
      this.#device,
      pipelineLayout,
      this.#vertexBufferLayout,
      shaderModule,
      format,
      depthStencilState
    );

    // this.#triangleStage = new TriangleStage(
    //   this.#device,
    //   pipelineLayout,
    //   this.#vertexBufferLayout,
    //   shaderModule,
    //   format,
    //   depthStencilState
    // );

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
    
    // Check invariants.
    if (!this.#device
        || !this.#uniformBuffer
        || !this.#depthTextureView
        || !this.#clearStage) {
      return;
    }
    
    // Update uniform buffer for the view and projection matrices
    const uniformData = new Float32Array(32);
    for (let i = 0; i < 16; i++) {
      uniformData[i] = view.data[i];
      uniformData[16 + i] = projection.data[i];
    }
    this.#device.queue.writeBuffer(this.#uniformBuffer, 0, uniformData);

    // Provide the list of vertices, lines, and triangles.
    const data = geometry.pack()

    // Upload Point Data
    const vertexNumBytes = data.pointData.byteLength;
    if (vertexNumBytes > 0) {
      if (!this.#vertexBuffer || this.#vertexBufferSize < vertexNumBytes) {
        if (this.#vertexBuffer) {
          this.#vertexBuffer.destroy();
        }
        this.#vertexBufferSize = vertexNumBytes;
        this.#vertexBuffer = this.#device.createBuffer({
          size: this.#vertexBufferSize,
          usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
      }
      this.#device.queue.writeBuffer(this.#vertexBuffer, 0, data.pointData);
    }

    // Upload Point Index Buffer
    const pointsNumBytes = data.pointIndices.byteLength;
    if (pointsNumBytes > 0) {
      if (!this.#pointIndexBuffer
        || this.#pointIndexBufferSize < pointsNumBytes) {
        if (this.#pointIndexBuffer) {
          this.#pointIndexBuffer.destroy();
        }
        this.#pointIndexBufferSize = pointsNumBytes;
        this.#pointIndexBuffer = this.#device.createBuffer({
          size: this.#pointIndexBufferSize,
          usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
        });
      }
      this.#device.queue.writeBuffer(this.#pointIndexBuffer, 0,
                                     data.pointIndices);
    }

    // Upload Line Index Buffer
    const linesNumBytes = data.lineIndices.byteLength;
    if (linesNumBytes > 0) {
      if (!this.#lineIndexBuffer || this.#lineIndexBufferSize < linesNumBytes) {
        if (this.#lineIndexBuffer) {
          this.#lineIndexBuffer.destroy();
        }
        this.#lineIndexBufferSize = linesNumBytes;
        this.#lineIndexBuffer = this.#device.createBuffer({
          size: this.#lineIndexBufferSize,
          usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
        });
      }
      this.#device.queue.writeBuffer(this.#lineIndexBuffer, 0,
                                     data.lineIndices);
    }

    // Upload Triangle Index Buffer
    const trianglesNumBytes = data.triangleIndices.byteLength;
    if (trianglesNumBytes > 0) {
      if (!this.#triangleIndexBuffer
        || this.#triangleIndexBufferSize < trianglesNumBytes) {
        if (this.#triangleIndexBuffer) {
          this.#triangleIndexBuffer.destroy();
        }
        this.#triangleIndexBufferSize = trianglesNumBytes;
        this.#triangleIndexBuffer = this.#device.createBuffer({
          size: this.#triangleIndexBufferSize,
          usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
        });
      }
      this.#device.queue.writeBuffer(this.#triangleIndexBuffer, 0,
                                     data.triangleIndices);
    }

    const commandEncoder = this.#device.createCommandEncoder();
    const textureView = this.#context.getCurrentTexture().createView();
    
    const renderPassDesc =
      this.#clearStage.createRenderPassDescriptor(
        textureView,
        this.#depthTextureView
      );

    const renderPass = commandEncoder.beginRenderPass(renderPassDesc);
    renderPass.setVertexBuffer(0, this.#vertexBuffer);
    if (this.#bindGroup) {
      renderPass.setBindGroup(0, this.#bindGroup);
    }
    
    if (this.#pointIndexBuffer
        && this.#lineIndexBuffer
        && this.#triangleIndexBuffer) {

      this.#pointStage?.render(renderPass, this.#pointIndexBuffer,
                               data.pointIndices.length);
      this.#lineStage?.render(renderPass, this.#lineIndexBuffer,
                              data.lineIndices.length);
      //this.#triangleStage?.render(renderPass, this.#triangleIndexBuffer,
      //                            data.triangleIndices.length);
    }
    renderPass.end();
    this.#device.queue.submit([commandEncoder.finish()]);
  }
}
