"use strict";

/**
 * Rectangle tool - draws rectangles on the canvas.
 * Left-click and drag to define the rectangle bounds.
 */
class Rectangle extends Tool {
  constructor(model = null) {
    super(model);
    this.name = "Rectangle";
    this.isDrawing = false;
    this.startX = 0;
    this.startY = 0;
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
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
  }

  onMouseMove(event) {
    if (!this.isDrawing) return;
    
    const width = event.clientX - this.startX;
    const height = event.clientY - this.startY;
    
    this._log(`drawing: size (${width}, ${height})`);
    
    this.lastX = event.clientX;
    this.lastY = event.clientY;
  }

  onMouseUp(event) {
    super.onMouseUp(event);
    this.isDrawing = false;
  }
}
