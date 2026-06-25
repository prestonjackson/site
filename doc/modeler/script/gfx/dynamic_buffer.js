// @ts-check
"use strict";

const MIN_BUFFER_SIZE = 512;

/**
 * DynamicBuffer - Utility helper that abstracts allocation, sizing, and updates
 * of a GPUBuffer on a GPUDevice.
 */
export class DynamicBuffer {
  /** @type {GPUDevice} */
  #device;
  /** @type {number} */
  #usage;
  /** @type {GPUBuffer} */
  #buffer;
  /** @type {number} */
  #size = 0;

  /**
   * @param {GPUDevice} device 
   * @param {number} usage 
   */
  constructor(device, usage) {
    this.#device = device;
    this.#usage = usage | GPUBufferUsage.COPY_DST;

    // Initialize a MIN_BUFFER_SIZE
    this.#size = MIN_BUFFER_SIZE;
    const zeros = new ArrayBuffer(this.#size);
    this.#buffer = this.#device.createBuffer({
      size: this.#size,
      usage: this.#usage,
    });
  }

  /**
   * Write data to the buffer, recreating the GPUBuffer if it's too small.
   * @param {ArrayBufferView} data 
   */
  write(data) {
    const byteLength = data.byteLength;
    if (byteLength === 0) return;

    if (this.#size < byteLength) {
      if (this.#buffer) {
        this.#buffer.destroy();
      }

      this.#size = Math.max(byteLength, MIN_BUFFER_SIZE);
      this.#buffer = this.#device.createBuffer({
        size: this.#size,
        usage: this.#usage | GPUBufferUsage.COPY_DST,
      });
    }

    this.#device.queue.writeBuffer(this.#buffer, 0, data);
  }

  /**
   * Get the underlying WebGPU buffer object.
   * @returns {GPUBuffer}
   */
  get buffer() {
    return this.#buffer;
  }
}
