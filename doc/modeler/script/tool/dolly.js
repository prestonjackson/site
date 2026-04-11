import { Tool } from "./tool.js";

export class Dolly extends Tool {
  #camera;
  #isDragging = false;
  #lastY = 0;

  constructor(camera) {
    super();
    this.name = "Dolly";
    this.#camera = camera;
  }

  activate() {
    super.activate();
    this.#isDragging = false;
  }

  onMouseDown(event) {
    super.onMouseDown(event);
    this.#isDragging = true;
    this.#lastY = event.clientY;

    return false;
  }

  onMouseMove(event) {
    if (!this.#isDragging) return;
    
    super.onMouseMove(event);

    const deltaY = event.clientY - this.#lastY;
    
    // Scale movement by a sensitivity factor
    const sensitivity = 0.002;
    
    if (this.#camera) {
      this.#camera.dolly(-deltaY * sensitivity);
    }

    this.#lastY = event.clientY;

    return true;
  }

  onMouseUp(event) {
    super.onMouseUp(event);
    this.#isDragging = false;
    return false;
  }
}
