"use strict";

/**
 * Orbit tool - rotates the camera around the focal point.
 * Left-click and drag to orbit the camera around the focal point.
 */
class Orbit extends Tool {
  constructor(model = null) {
    super(model);
    this.name = "Orbit";
    this.isDragging = false;
    this.lastX = 0;
    this.lastY = 0;
  }

  activate() {
    super.activate();
    this.isDragging = false;
  }

  onMouseDown(event) {
    super.onMouseDown(event);
    this.isDragging = true;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
  }

  onMouseMove(event) {
    if (!this.isDragging) return;
    
    const deltaX = event.clientX - this.lastX;
    const deltaY = event.clientY - this.lastY;
    
    // Scale movement by a sensitivity factor
    const sensitivity = 0.003;
    
    if (this.model && this.model.camera) {
      // Negative deltaY for vertical rotation (pitching)
      this.model.camera.orbit(-deltaY * sensitivity, deltaX * sensitivity);
      this.model.dirty = true;
      if (this.model.canvas) {
        this.model.canvas.requestRender();
      }
    }
    
    this._log(`dragging: delta (${deltaX}, ${deltaY})`);
    
    this.lastX = event.clientX;
    this.lastY = event.clientY;
  }

  onMouseUp(event) {
    super.onMouseUp(event);
    this.isDragging = false;
  }
}
