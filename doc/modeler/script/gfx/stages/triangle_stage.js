// @ts-check
"use strict";

export class TriangleStage {
  /**
   * @param {GPUDevice} device
   * @param {GPUPipelineLayout} pipelineLayout
   * @param {GPUVertexBufferLayout} vertexBufferLayout
   * @param {GPUShaderModule} shaderModule
   * @param {GPUTextureFormat} format
   * @param {GPUDepthStencilState} depthStencilState
   */
  constructor(device, pipelineLayout, vertexBufferLayout, shaderModule, format, depthStencilState) {
    this.pipeline = device.createRenderPipeline({
      layout: pipelineLayout,
      vertex: {
        module: shaderModule,
        entryPoint: "vs_main",
        buffers: [vertexBufferLayout],
      },
      fragment: {
        module: shaderModule,
        entryPoint: "fs_main",
        targets: [{ format }],
      },
      primitive: {
        topology: "triangle-list",
      },
      depthStencil: depthStencilState,
    });
  }

  /**
   * @param {GPURenderPassEncoder} renderPass
   * @param {GPUBuffer} indexBuffer
   * @param {number} indexCount
   */
  render(renderPass, indexBuffer, indexCount) {
    if (indexCount <= 0) return;

    renderPass.setPipeline(this.pipeline);
    renderPass.setIndexBuffer(indexBuffer, "uint32");
    renderPass.drawIndexed(indexCount);
  }
}
