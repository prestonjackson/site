"use strict";

/**
 * Base class for tools that handle mouse events on the canvas.
 * Tools are activated/deactivated and receive mouse events (down, move, up)
 * while active.
 */
class Tool {
  constructor() {
    this.name = "Tool";
  }

  /**
   * Called when this tool is activated (becomes the active tool).
   */
  activate() {
    console.log("activated");
  }

  /**
   * Called when this tool is deactivated (another tool takes over or app closes).
   */
  deactivate() {
    console.log("deactivated");
  }

  /**
   * Called when the mouse button is pressed on the canvas while this tool is active.
   * @param {MouseEvent} event - The mouse event
   * @returns {boolean} - Return true if the event caused a change that requires re-rendering
   */
  onMouseDown(event) {
    console.log(`mouseDown at (${event.clientX}, ${event.clientY})`);
    return false;
  }

  /**
   * Called when the mouse moves on the canvas while this tool is active.
   * @param {MouseEvent} event - The mouse event
   * @return {boolean} - Return true if the event caused a change that requires re-rendering
   */
  onMouseMove(event) {
    console.log(`mouseMove at (${event.clientX}, ${event.clientY})`);
    return false;
  }

  /**
   * Called when the mouse button is released while this tool is active.
   * @param {MouseEvent} event - The mouse event
   * @returns {boolean} - Return true if the event caused a change that requires re-rendering
   */
  onMouseUp(event) {
    console.log(`mouseUp at (${event.clientX}, ${event.clientY})`);
    return false;
  }
}
