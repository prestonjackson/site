// @ts-check
"use strict";

export class PointStage {
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
        topology: "point-list",
      },
      depthStencil: depthStencilState,
    });
  }

  /**
   * @param {GPURenderPassEncoder} renderPass
   * @param {GPUBuffer | null} indexBuffer
   * @param {number} indexCount
   */
  render(renderPass, indexBuffer, indexCount) {
    if (!indexBuffer || indexCount <= 0) return;

    renderPass.setPipeline(this.pipeline);
    renderPass.setIndexBuffer(indexBuffer, "uint32");
    renderPass.draw(indexCount);
  }
}
