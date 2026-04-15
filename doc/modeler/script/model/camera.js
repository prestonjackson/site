// @ts-check
"use strict";

import { Vec3 } from "../math/vec3.js";
import { Mat4 } from "../math/mat4.js";
import { Point } from "../math/point.js";

/**
 * Camera - Manages view and projection matrices with truck, dolly, and orbit operations
 */
export class Camera {
  /** @type {Point} */
  position;
  /** @type {Point} */
  target;
  /** @type {Vec3} */
  up;
  /** @type {number} */
  fov;
  /** @type {number} */
  aspect;
  /** @type {number} */
  near;
  /** @type {number} */
  far;

  /**
   * @param {Point|null} [position]
   * @param {Point|null} [target]
   * @param {Vec3|null} [up]
   */
  constructor(position = null, target = null, up = null) {
    this.position = position || new Point(0, 0, 2);
    this.target = target || new Point(0, 0, 0);
    this.up = up || new Vec3(0, 1, 0);

    this.fov = Math.PI / 4; // 45 degrees
    this.aspect = 1.0;
    this.near = 0.1;
    this.far = 100.0;
  }

  /**
   * Truck - move camera left/right and up/down in screen space
   * @param {number} dx @param {number} dy
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
   * @param {number} distance - Positive to move forward, negative to move backward
   */
  dolly(distance) {
    const direction = this.target.subtract(this.position).normalize();
    const movement = direction.scale(distance);

    this.position = this.position.add(movement);
    this.target = this.target.add(movement);
  }

  /**
   * Orbit - rotate camera around the target point
   * @param {number} angleX - Rotation around the local right axis (vertical)
   * @param {number} angleY - Rotation around the world up axis (horizontal)
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
   * @param {Point} eye - Camera position
   * @param {Point} target - Point to look at
   * @param {Vec3} up - Up direction
   */
  lookAt(eye, target, up) {
    this.position = eye;
    this.target = target;
    this.up = up;
  }

  /**
   * Create a perspective projection matrix
   * @param {number} fov - Field of view in radians
   * @param {number} aspect - Aspect ratio (width/height)
   * @param {number} near - Near clipping plane
   * @param {number} far - Far clipping plane
   * @returns {Mat4}
   */
  static perspective(fov, aspect, near, far) {
    const f = 1.0 / Math.tan(fov / 2.0);
    const mat = new Mat4();
    mat.data[0] = f / aspect;
    mat.data[5] = f;
    mat.data[10] = (near + far) / (near - far);
    mat.data[11] = -1.0;
    mat.data[14] = (2.0 * near * far) / (near - far);
    mat.data[15] = 0.0;
    return mat;
  }

  /**
   * Create a lookAt view matrix
   * @param {Point} eye - camera position
   * @param {Point} target - point to look at
   * @param {Vec3} up - up direction
   * @returns {Mat4}
   */
  static lookAt(eye, target, up) {
    const f = target.subtract(eye).normalize();
    const s = f.cross(up).normalize();
    const u = s.cross(f);

    const mat = new Mat4();
    mat.data[0] = s.x;
    mat.data[1] = s.y;
    mat.data[2] = s.z;
    mat.data[4] = u.x;
    mat.data[5] = u.y;
    mat.data[6] = u.z;
    mat.data[8] = -f.x;
    mat.data[9] = -f.y;
    mat.data[10] = -f.z;
    mat.data[12] = -s.dot(eye.toVec3());
    mat.data[13] = -u.dot(eye.toVec3());
    mat.data[14] = f.dot(eye.toVec3());
    mat.data[15] = 1.0;

    return mat;
  }

  /**
   * Get the view transformation
   * @returns {Mat4}
   */
  get viewTransform() {
    return Camera.lookAt(this.position, this.target, this.up);
  }

  /**
   * Get the projection transformation
   * @returns {Mat4}
   */
  get projectionTransform() {
    return Camera.perspective(this.fov, this.aspect, this.near, this.far);
  }

  /**
   * Set the aspect ratio (typically canvas width / height)
   * @param {number} aspect The aspect ratio
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
  screenToWorldOnPlane(screenX, screenY, viewportWidth, viewportHeight,
                       planeZ = 0) {
    // Convert screen coordinates to normalized device coordinates (-1 to 1)
    const ndcX = (screenX / viewportWidth) * 2 - 1;
    const ndcY = 1 - (screenY / viewportHeight) * 2;

    // Create two points on the ray in NDC space
    const ndcNear = new Vec3(ndcX, ndcY, -1);
    const ndcFar = new Vec3(ndcX, ndcY, 1);

    // Get camera matrices
    const viewMatrix = this.viewTransform;
    const projMatrix = this.projectionTransform;

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
