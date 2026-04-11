import { Tool } from "./tool.js";

export class Truck extends Tool {
  #camera;
  #isDragging = false;
  #lastX = 0;
  #lastY = 0;

  constructor(camera) {
    super();
    this.name = "Truck";
    this.#camera = camera;
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

    // No need to request render on mouse down
    return false;
  }

  onMouseMove(event) {
    if (!this.#isDragging) return;
    
    super.onMouseMove(event);
    const deltaX = event.clientX - this.#lastX;
    const deltaY = event.clientY - this.#lastY;
    
    // Scale movement by a sensitivity factor
    const sensitivity = 0.002;
    
    if (this.#camera) {
      this.#camera.truck(deltaX * sensitivity, -deltaY * sensitivity);
    }
    
    this.#lastX = event.clientX;
    this.#lastY = event.clientY;

    // Indicate that the model was modified, it's dirty.
    return true; 
  }

  onMouseUp(event) {
    super.onMouseUp(event);
    this.#isDragging = false;

    // No need to request render on mouse up
    return false; 
  }
}
