import { Tool } from "./tool.js";

export class Oval extends Tool {
  #isDrawing = false;
  #startX = 0;
  #startY = 0;
  #lastX = 0;
  #lastY = 0;

  constructor() {
    super();
    this.name = "Oval";
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

    return false;
  }

  onMouseMove(event) {
    if (!this.#isDrawing) return;
    
    super.onMouseMove(event);

    const width = event.clientX - this.#startX;
    const height = event.clientY - this.#startY;
    
    // TODO: Implement actual oval drawing logic here, using width and height to define the bounds of the oval.
    
    this.#lastX = event.clientX;
    this.#lastY = event.clientY;

    return true;
  }

  onMouseUp(event) {
    super.onMouseUp(event);
    this.#isDrawing = false;

    return false;
  }
}
