"use strict";

/**
 * Pencil tool - draws freehand points on the ground plane.
 * Left-click and drag to draw small triangles at points on z=0.
 */
class Pencil extends Tool {
  constructor(model = null) {
    super(model);
    this.name = "Pencil";
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;
    this.pointSize = 0.1; // Size of the small triangles
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
    
    if (!this.model || !this.model.canvas) {
      return;
    }

    // Convert screen coordinates to world coordinates on ground plane (z=0)
    const worldPos = this.model.canvas.screenToWorldOnPlane(event.clientX, event.clientY, 0);
    
    if (worldPos) {
      // Add a small triangle at this position
      this.addPointTriangle(worldPos);
      
      this.model.dirty = true;
      if (this.model.canvas) {
        this.model.canvas.requestRender();
      }

      this._log(`drew point at (${worldPos.x.toFixed(2)}, ${worldPos.y.toFixed(2)}, ${worldPos.z.toFixed(2)})`);
    }

    this.lastX = event.clientX;
    this.lastY = event.clientY;
  }

  onMouseUp(event) {
    super.onMouseUp(event);
    this.isDrawing = false;
  }

  /**
   * Add a small triangle at a world position.
   */
  addPointTriangle(center) {
    const size = this.pointSize / 2;

    // Create three vertices in a triangle pattern around the center
    const v0 = this.model.addVertex(center.x, center.y + size, center.z);
    const v1 = this.model.addVertex(center.x - size, center.y - size, center.z);
    const v2 = this.model.addVertex(center.x + size, center.y - size, center.z);

    // Add the triangle face
    this.model.addFace(v0, v1, v2);

    // Re-upload to GPU so the new geometry is available
    this.model.uploadToGPU();
  }
}
