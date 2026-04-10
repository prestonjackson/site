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

  /**
   * Convert screen coordinates to world coordinates on a plane.
   * Uses raycasting to find intersection with the plane.
   * @param {number} screenX - Screen X coordinate (in pixels)
   * @param {number} screenY - Screen Y coordinate (in pixels)
   * @param {number} viewportWidth - Width of the viewport (in pixels)
   * @param {number} viewportHeight - Height of the viewport (in pixels)
   * @param {number} planeZ - Z coordinate of the intersection plane (default 0)
   * @returns {Vec3|null} World position on the plane, or null if ray is parallel
   */
  screenToWorldOnPlane(screenX, screenY, viewportWidth, viewportHeight, planeZ = 0) {
    // Convert screen coordinates to normalized device coordinates (-1 to 1)
    const ndcX = (screenX / viewportWidth) * 2 - 1;
    const ndcY = 1 - (screenY / viewportHeight) * 2;

    // Create two points on the ray in NDC space
    const ndcNear = new Vec3(ndcX, ndcY, -1);
    const ndcFar = new Vec3(ndcX, ndcY, 1);

    // Get camera matrices
    const viewMatrix = this.getViewMatrix();
    const projMatrix = this.getProjectionMatrix();

    // Compute inverse of projection * view
    const projViewMatrix = projMatrix.multiply(viewMatrix);
    const invProjView = projViewMatrix.invert();

    // Unproject NDC points to world space
    const worldNear = invProjView.transformPoint(ndcNear);
    const worldFar = invProjView.transformPoint(ndcFar);

    // Ray from worldNear to worldFar
    const rayDir = worldFar.subtract(worldNear).normalize();

    // Find intersection with plane at z = planeZ
    // Ray: P = worldNear + t * rayDir
    // Plane: z = planeZ
    // Solve: worldNear.z + t * rayDir.z = planeZ
    if (Math.abs(rayDir.z) < 0.0001) {
      // Ray is parallel to plane
      return null;
    }

    const t = (planeZ - worldNear.z) / rayDir.z;
    const intersection = worldNear.add(rayDir.scale(t));

    return intersection;
  }
}
