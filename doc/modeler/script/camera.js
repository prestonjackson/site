"use strict";

/**
 * Camera - Manages view and projection matrices with truck, dolly, and orbit operations
 */
class Camera {
  constructor(position = null, target = null, up = null) {
    this.position = position || new Vec3(0, 0, 2);
    this.target = target || new Vec3(0, 0, 0);
    this.up = up || new Vec3(0, 1, 0);
    
    this.fov = Math.PI / 4; // 45 degrees
    this.aspect = 1.0;
    this.near = 0.1;
    this.far = 100.0;
  }

  /**
   * Truck - move camera left/right and up/down in screen space
   */
  truck(dx, dy) {
    // Get the forward vector (from eye to target)
    const forward = this.target.subtract(this.position).normalize();
    
    // Get the right vector
    const right = forward.cross(this.up).normalize();
    
    // Get the actual up vector (perpendicular to both forward and right)
    const actualUp = right.cross(forward).normalize();
    
    // Move camera and target by the same amount
    const movement = right.scale(dx).add(actualUp.scale(dy));
    
    this.position = this.position.add(movement);
    this.target = this.target.add(movement);
  }

  /**
   * Dolly - move camera forward/backward along the view direction
   */
  dolly(distance) {
    const direction = this.target.subtract(this.position).normalize();
    const movement = direction.scale(distance);
    
    this.position = this.position.add(movement);
    this.target = this.target.add(movement);
  }

  /**
   * Orbit - rotate camera around the target point
   */
  orbit(angleX, angleY) {
    // Vector from target to camera
    let offset = this.position.subtract(this.target);
    
    // Rotate around Y axis (horizontal)
    let rotY = Mat4.rotateY(angleY);
    offset = rotY.transformPoint(offset);
    
    // Rotate around the local right axis (vertical)
    let right = offset.normalize().cross(this.up).normalize();
    let rotX = Mat4.rotateAxis(right, angleX);
    offset = rotX.transformPoint(offset);
    
    // Update position
    this.position = this.target.add(offset);
    
    // Keep up vector consistent
    this.up = new Vec3(0, 1, 0);
  }

  /**
   * Set the camera to look at a target from a position
   */
  lookAt(eye, target, up) {
    this.position = eye;
    this.target = target;
    this.up = up;
  }

  /**
   * Get the view matrix
   */
  getViewMatrix() {
    return Mat4.lookAt(this.position, this.target, this.up);
  }

  /**
   * Get the projection matrix
   */
  getProjectionMatrix() {
    return Mat4.perspective(this.fov, this.aspect, this.near, this.far);
  }

  /**
   * Set the aspect ratio (typically canvas width / height)
   */
  setAspect(aspect) {
    this.aspect = aspect;
  }
}
