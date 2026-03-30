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
    this._log("activated");
  }

  /**
   * Called when this tool is deactivated (another tool takes over or app closes).
   */
  deactivate() {
    this._log("deactivated");
  }

  /**
   * Called when the mouse button is pressed on the canvas while this tool is active.
   * @param {MouseEvent} event - The mouse event
   */
  onMouseDown(event) {
    this._log(`mouseDown at (${event.clientX}, ${event.clientY})`);
  }

  /**
   * Called when the mouse moves on the canvas while this tool is active.
   * @param {MouseEvent} event - The mouse event
   */
  onMouseMove(event) {
    this._log(`mouseMove at (${event.clientX}, ${event.clientY})`);
  }

  /**
   * Called when the mouse button is released while this tool is active.
   * @param {MouseEvent} event - The mouse event
   */
  onMouseUp(event) {
    this._log(`mouseUp at (${event.clientX}, ${event.clientY})`);
  }

  /**
   * Helper method to log messages with the tool's name.
   * @param {string} message - The message to log
   */
  _log(message) {
    console.log(`[${this.name}] ${message}`);
  }
}
