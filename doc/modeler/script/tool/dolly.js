"use strict";

/**
 * Dolly tool - moves the camera closer or farther from the focal point.
 * Left-click and drag up to dolly out (zoom out), drag down to dolly in (zoom in).
 */
class Dolly extends Tool {
  constructor(camera) {
    this.name = "Dolly";
    this.camera = camera;
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

    return false;
  }

  onMouseMove(event) {
    if (!this.isDragging) return;
    
    super.onMouseMove(event);

    const deltaY = event.clientY - this.lastY;
    
    // Scale movement by a sensitivity factor
    const sensitivity = 0.002;
    
    this.camera.dolly(-deltaY * sensitivity);

    this.lastY = event.clientY;

    return true;
  }

  onMouseUp(event) {
    super.onMouseUp(event);
    this.isDragging = false;
    return false;
  }
}
