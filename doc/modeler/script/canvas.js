"use strict";

// Canvas class for WebGPU rendering
class Canvas {
  constructor(element) {
    this.native = element;
    this.adapter = null;
    this.device = null;
    this.context = null;
    this.renderPipeline = null;
    this.triangleBuffer = null;

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

    // Create render pipeline
    this.renderPipeline = this.device.createRenderPipeline({
      layout: "auto",
      vertex: {
        module: shaderModule,
        entryPoint: "vs_main",
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

    // Start render loop
    this.render();
  }

  render = () => {
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
    renderPass.draw(3, 1, 0, 0);
    renderPass.end();

    this.device.queue.submit([commandEncoder.finish()]);
    this.dirty = false;

    //if (this.dirty) {
    //  requestAnimationFrame(this.render);
    //}
  };
}
