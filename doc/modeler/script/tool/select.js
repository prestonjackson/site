import { Tool } from "./tool.js";

export class Select extends Tool {
  #isDragging = false;
  #lastX = 0;
  #lastY = 0;

  constructor() {
    super();
    this.name = "Select";
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
  }

  onMouseMove(event) {
    if (!this.#isDragging) return;
    
    const deltaX = event.clientX - this.#lastX;
    const deltaY = event.clientY - this.#lastY;
    
    console.log(`dragging: delta (${deltaX}, ${deltaY})`);
    
    this.#lastX = event.clientX;
    this.#lastY = event.clientY;
  }

  onMouseUp(event) {
    super.onMouseUp(event);
    this.#isDragging = false;
  }
}
