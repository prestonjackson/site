"use strict";

/**
 * Dolly tool - moves the camera closer or farther from the focal point.
 * Left-click and drag up to dolly out (zoom out), drag down to dolly in (zoom in).
 */
class Dolly extends Tool {
  constructor(model = null) {
    super(model);
    this.name = "Dolly";
    this.isDragging = false;
    this.lastY = 0;
  }

  activate() {
    super.activate();
    this.isDragging = false;
  }

  onMouseDown(event) {
    super.onMouseDown(event);
    this.isDragging = true;
    this.lastY = event.clientY;
  }

  onMouseMove(event) {
    if (!this.isDragging) return;
    
    const deltaY = event.clientY - this.lastY;
    
    // Scale movement by a sensitivity factor
    const sensitivity = 0.002;
    
    if (this.model && this.model.camera) {
      // Negative deltaY means moving up = moving away (dolly out)
      this.model.camera.dolly(-deltaY * sensitivity);
      this.model.dirty = true;
      if (this.model.canvas) {
        this.model.canvas.requestRender();
      }
    }
    
    this._log(`dragging: delta Y = ${deltaY}`);
    
    this.lastY = event.clientY;
  }

  onMouseUp(event) {
    super.onMouseUp(event);
    this.isDragging = false;
  }
}
