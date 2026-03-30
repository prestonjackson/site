"use strict";

/**
 * Pencil tool - draws freehand on the canvas.
 * Left-click and drag to draw.
 */
class Pencil extends Tool {
  constructor() {
    super();
    this.name = "Pencil";
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;
  }

  activate() {
    super.activate();
    this.isDrawing = false;
  }

  onMouseDown(event) {
    super.onMouseDown(event);
    this.isDrawing = true;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
  }

  onMouseMove(event) {
    if (!this.isDrawing) return;
    
    const deltaX = event.clientX - this.lastX;
    const deltaY = event.clientY - this.lastY;
    
    this._log(`drawing: delta (${deltaX}, ${deltaY})`);
    
    this.lastX = event.clientX;
    this.lastY = event.clientY;
  }

  onMouseUp(event) {
    super.onMouseUp(event);
    this.isDrawing = false;
  }
}
