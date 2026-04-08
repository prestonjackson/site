"use strict";

/**
 * Orbit tool - rotates the camera around the focal point.
 * Left-click and drag to orbit the camera around the focal point.
 */
class Orbit extends Tool {
  constructor(camera) {
    super();
    this.camera = camera;
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

    return false;
  }

  onMouseMove(event) {
    if (!this.isDragging) return;
    
    const deltaX = event.clientX - this.lastX;
    const deltaY = event.clientY - this.lastY;
    
    // Scale movement by a sensitivity factor
    const sensitivity = 0.003;
    
    this.model.camera.orbit(-deltaY * sensitivity, deltaX * sensitivity);
    
    this.lastX = event.clientX;
    this.lastY = event.clientY;

    return true;
  }

  onMouseUp(event) {
    super.onMouseUp(event);
    this.isDragging = false;

    return false;
  }
}
