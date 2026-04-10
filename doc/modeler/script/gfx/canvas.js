"use strict";

// Canvas class for WebGPU rendering
class Canvas {
  constructor(context) {
    // The webgpu context from the canvas element.
    this.context = context;

    this.adapter = null;
    this.device = null;
    this.renderPipeline = null;
    this.vertexBufferLayout = null;
    this.uniformBuffer = null;
    this.bindGroup = null;
    this.frameRequested = false;
  }

  async initialize() {
    // Get WebGPU adapter (which reprents the GPU).
    this.adapter = await navigator.gpu.requestAdapter();
    if (!this.adapter) {
      throw new Error("WebGPU adapter not available");
    }

    // Get device from adapter (represents a connection to the GPU).
    this.device = await this.adapter.requestDevice();
    if (!this.device) {
      throw new Error("WebGPU device not available");
    }

    // Set device on model, if provided
    if (this.model) {
      this.model.device = this.device;
    }

    // Configure context with device and preferred format. The format
    // determines how colors are stored in the canvas texture.
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

    // Create bind group layout, which describes the resources
    // (buffers, textures) that will be bound to the shader.
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
      layout: pipelineLayout, // 
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

  /**
   * Convert screen coordinates to world coordinates on a plane (default z=0).
   * Delegates to the camera's screenToWorldOnPlane method.
   */
  screenToWorldOnPlane(screenX, screenY, planeZ = 0) {
    if (!this.model || !this.model.camera) {
      return null;
    }
    return this.model.camera.screenToWorldOnPlane(
      screenX,
      screenY,
      this.native.width,
      this.native.height,
      planeZ
    );
  }

  render = (timestamp) => {


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
  };

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
      this.faceCount = this.topology.faces.length / 3;
    }
  }
}
