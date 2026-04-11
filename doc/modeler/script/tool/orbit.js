import { Tool } from "./tool.js";

export class Orbit extends Tool {
  #camera;
  #isDragging = false;
  #lastX = 0;
  #lastY = 0;

  constructor(camera) {
    super();
    this.#camera = camera;
    this.name = "Orbit";
  }

  activate() {
    super.activate();
    this.#isDragging = false;
  }

  onMouseDown(event) {
    super.onMouseDown(event);
    this.#isDragging = true;
    this.#lastX = event.clientX;
    this.#lastY = event.clientY;

    return false;
  }

  onMouseMove(event) {
    if (!this.#isDragging) return;
    
    const deltaX = event.clientX - this.#lastX;
    const deltaY = event.clientY - this.#lastY;
    
    // Scale movement by a sensitivity factor
    const sensitivity = 0.003;
    
    if (this.#camera) {
      this.#camera.orbit(-deltaY * sensitivity, deltaX * sensitivity);
    }
    
    this.#lastX = event.clientX;
    this.#lastY = event.clientY;

    return true;
  }

  onMouseUp(event) {
    super.onMouseUp(event);
    this.#isDragging = false;

    return false;
  }
}
