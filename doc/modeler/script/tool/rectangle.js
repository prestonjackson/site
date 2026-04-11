import { Tool } from "./tool.js";

export class Rectangle extends Tool {
  #isDrawing = false;
  #startX = 0;
  #startY = 0;
  #lastX = 0;
  #lastY = 0;

  constructor() {
    super();
    this.name = "Rectangle";
  }

  activate() {
    super.activate();
    this.#isDrawing = false;
  }

  onMouseDown(event) {
    super.onMouseDown(event);
    this.#isDrawing = true;
    this.#startX = event.clientX;
    this.#startY = event.clientY;
    this.#lastX = event.clientX;
    this.#lastY = event.clientY;
  }

  onMouseMove(event) {
    if (!this.#isDrawing) return;
    
    const width = event.clientX - this.#startX;
    const height = event.clientY - this.#startY;
    
    console.log(`drawing: size (${width}, ${height})`);
    
    this.#lastX = event.clientX;
    this.#lastY = event.clientY;
  }

  onMouseUp(event) {
    super.onMouseUp(event);
    this.#isDrawing = false;
  }
}
