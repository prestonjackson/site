"use strict";

// Canvas class for WebGPU rendering
class Canvas {
  constructor(element, model) {
    this.native = element;
    this.model = model;
    this.adapter = null;
    this.device = null;
    this.context = null;
    this.renderPipeline = null;
    this.vertexBufferLayout = null;
    this.uniformBuffer = null;
    this.bindGroup = null;
    this.frameRequested = false;

    this.dirty = true;
  }

  async initialize() {
    // Get WebGPU adapter and device
    this.adapter = await navigator.gpu.requestAdapter();
    if (!this.adapter) {
      throw new Error("WebGPU adapter not available");
    }

    this.device = await this.adapter.requestDevice();
    if (!this.device) {
      throw new Error("WebGPU device not available");
    }

    // Set device on model if provided
    if (this.model) {
      this.model.device = this.device;
    }

    // Get canvas context
    const context = this.native.getContext("webgpu");
    if (!context) {
      throw new Error("WebGPU context not available");
    }
    this.context = context;

    // Configure context
    const format = navigator.gpu.getPreferredCanvasFormat();
    this.context.configure({
      device: this.device,
      format: format,
    });

    // Load shader from file
    const shaderResponse = await fetch("/modeler/script/triangle.wgsl");
    const shaderCode = await shaderResponse.text();

    // Create shader module
    const shaderModule = this.device.createShaderModule({
      code: shaderCode,
    });

    // Define vertex buffer layout
    this.vertexBufferLayout = {
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
    this.uniformBuffer = this.device.createBuffer({
      size: 128,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // Create bind group layout
    const bindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          buffer: { type: "uniform" },
        },
      ],
    });

    // Create pipeline layout with bind group
    const pipelineLayout = this.device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout],
    });

    // Create bind group
    this.bindGroup = this.device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: { buffer: this.uniformBuffer },
        },
      ],
    });

    // Create render pipeline
    this.renderPipeline = this.device.createRenderPipeline({
      layout: pipelineLayout,
      vertex: {
        module: shaderModule,
        entryPoint: "vs_main",
        buffers: [this.vertexBufferLayout],
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

    // Upload model data to GPU
    if (this.model) {
      this.model.uploadToGPU();
    }

    // Start render loop
    this.requestRender();
  }

  /**
   * Request a render frame to be scheduled.
   * Only schedules if a frame isn't already pending.
   */
  requestRender() {
    if (!this.frameRequested) {
      this.frameRequested = true;
      requestAnimationFrame(this.render);
    }
  }

  render = () => {
    // Update uniform buffer with camera matrices
    if (this.model && this.model.camera) {
      const camera = this.model.camera;
      
      // Set canvas aspect ratio
      camera.setAspect(this.native.width / this.native.height);
      
      // Get matrices from camera
      const viewMatrix = camera.getViewMatrix();
      const projMatrix = camera.getProjectionMatrix();
      
      // Create uniform data buffer (2 mat4x4 = 32 floats = 128 bytes)
      const uniformData = new Float32Array(32);
      
      // Copy view matrix (column-major)
      for (let i = 0; i < 16; i++) {
        uniformData[i] = viewMatrix.data[i];
      }
      
      // Copy projection matrix (column-major)
      for (let i = 0; i < 16; i++) {
        uniformData[16 + i] = projMatrix.data[i];
      }
      
      // Write to uniform buffer
      this.device.queue.writeBuffer(this.uniformBuffer, 0, uniformData);
    }

    const commandEncoder = this.device.createCommandEncoder();
    const textureView = this.context.getCurrentTexture().createView();

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

    renderPass.setPipeline(this.renderPipeline);
    
    // Bind uniform group
    if (this.bindGroup) {
      renderPass.setBindGroup(0, this.bindGroup);
    }

    // Draw faces (triangles)
    if (this.model && this.model.vertexBuffer && this.model.faceIndexBuffer && this.model.faceCount > 0) {
      renderPass.setVertexBuffer(0, this.model.vertexBuffer);
      renderPass.setIndexBuffer(this.model.faceIndexBuffer, "uint32");
      renderPass.drawIndexed(this.model.faceCount * 3);
    }

    // Draw edges (lines)
    if (this.model && this.model.vertexBuffer && this.model.edgeIndexBuffer && this.model.edgeCount > 0) {
      renderPass.setVertexBuffer(0, this.model.vertexBuffer);
      renderPass.setIndexBuffer(this.model.edgeIndexBuffer, "uint32");
      renderPass.drawIndexed(this.model.edgeCount * 2);
    }

    // Draw vertices (points)
    if (this.model && this.model.vertexBuffer && this.model.vertexCount > 0) {
      renderPass.setVertexBuffer(0, this.model.vertexBuffer);
      renderPass.draw(this.model.vertexCount);
    }

    renderPass.end();

    this.device.queue.submit([commandEncoder.finish()]);

    // Mark frame as no longer pending
    this.frameRequested = false;
    
    // Clear dirty flag now that we've rendered
    if (this.model) {
      this.model.dirty = false;
    }

    // Queue next frame if model becomes dirty again
    if (this.model && this.model.dirty) {
      this.requestRender();
    }
  };
}
