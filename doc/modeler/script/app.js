// @ts-check
"use strict";

import { Model } from "./model/model.js";
import { Canvas } from "./gfx/canvas.js";
import { Connection } from "./util/connection.js";
import { Select } from "./tool/select.js";
import { Orbit } from "./tool/orbit.js";
import { Dolly } from "./tool/dolly.js";
import { Truck } from "./tool/truck.js";
import { Pencil } from "./tool/pencil.js";
import { Rectangle } from "./tool/rectangle.js";
import { Topology } from "./topo/topology.js";
import { Size2 } from "./math/size2.js";

/**
 * Application - The main controller class for the Modeler application.
 * Manages the lifecycle of the Model, Canvas, and Tool system.
 */
class Application {
  /** @type {string} */
  #baseURI;
  /** @type {string} */
  #id;
  /** @type {Connection} */
  #connection;
  /** @type {Canvas} */
  #canvas;
  /** @type {Model} */
  #model;
  /** @type {Topology} */
  #toolTopology;
  /** @type {any} */
  #activeTool; // Typed as any because all tools extend Tool but have different signatures
  /** @type {HTMLElement?} */
  #activeToolButton;
  /** @type {boolean} */
  #renderRequested = false;

  /** @type {HTMLButtonElement} */
  #offerButton;
  /** @type {HTMLButtonElement} */
  #answerButton;
  /** @type {HTMLButtonElement} */
  #connectButton;
  /** @type {HTMLButtonElement} */
  #disconnectButton;
  /** @type {HTMLButtonElement} */
  #sendButton;
  /** @type {HTMLInputElement} */
  #messageInputBox;
  /** @type {HTMLElement} */
  #receiveBox;

  /** @type {HTMLElement} */
  #truckButton;
  /** @type {HTMLElement} */
  #dollyButton;
  /** @type {HTMLElement} */
  #orbitButton;
  /** @type {HTMLElement} */
  #selectButton;
  /** @type {HTMLElement} */
  #pencilButton;
  /** @type {HTMLElement} */
  #rectangleButton;


  /** @param {string} baseURI */
  constructor(baseURI) {
    this.#baseURI = baseURI;
    this.#id = "abcd";

    // Create a model to hold geometric data
    this.#model = new Model();
    this.#model.insertTestGeometry();
    this.#toolTopology = new Topology();

    // Set up the canvas with WebGPU
    const canvasElement =
        /** @type {HTMLCanvasElement} */ (document.getElementById("canvas"));
    const context = canvasElement.getContext("webgpu");
    if (!context) {
      throw new Error("WebGPU context not available");
    }
    this.#canvas = new Canvas(context,
        new Size2(canvasElement.clientWidth, canvasElement.clientHeight),
        window.devicePixelRatio);
    this.#canvas.initialize()
        .then(() => this.requestRender())
        .catch(err => {
          throw new Error("Failed to initialize canvas: " + err);
        });

    // Register canvas mouse event listeners.
    canvasElement.addEventListener('mousedown', (e) => this.onCanvasMouseDown(e));
    canvasElement.addEventListener('mousemove', (e) => this.onCanvasMouseMove(e));
    canvasElement.addEventListener('mouseup', (e) => this.onCanvasMouseUp(e));

    // Set up the canvas resolution.
    window.addEventListener("resize", () => this.resizeCanvas());
    this.resizeCanvas();

    // Set handlers for the toolbar buttons.
    this.#activeTool = null;
    this.#activeToolButton = null;
    this.#selectButton =
       /** @type {HTMLButtonElement} */ (document.getElementById("select-button"));
    this.#orbitButton = 
       /** @type {HTMLButtonElement} */ (document.getElementById("orbit-button"));
    this.#dollyButton = 
       /** @type {HTMLButtonElement} */ (document.getElementById("dolly-button"));
    this.#truckButton = 
       /** @type {HTMLButtonElement} */ (document.getElementById("truck-button"));
    this.#pencilButton = 
       /** @type {HTMLButtonElement} */ (document.getElementById("pencil-button"));
    this.#rectangleButton = 
       /** @type {HTMLButtonElement} */ (document.getElementById("rectangle-button"));

    this.#selectButton.onclick = () => this.activateTool('select');
    this.#orbitButton.onclick = () => this.activateTool('orbit');
    this.#dollyButton.onclick = () => this.activateTool('dolly');
    this.#truckButton.onclick = () => this.activateTool('truck');
    this.#pencilButton.onclick = () => this.activateTool('pencil');
    this.#rectangleButton.onclick = () => this.activateTool('rectangle');

    // Set handlers for the control buttons.
    this.#offerButton = 
       /** @type {HTMLButtonElement} */ (document.getElementById("offer-button"));
    this.#answerButton = 
       /** @type {HTMLButtonElement} */ (document.getElementById("answer-button"));
    this.#connectButton = 
       /** @type {HTMLButtonElement} */ (document.getElementById("connect-button"));
    this.#disconnectButton = 
       /** @type {HTMLButtonElement} */ (document.getElementById("disconnect-button"));
    this.#sendButton = 
       /** @type {HTMLButtonElement} */ (document.getElementById("send-button"));
    this.#messageInputBox = 
       /** @type {HTMLInputElement} */ (document.getElementById("message-input-box"));
    this.#receiveBox = 
       /** @type {HTMLElement} */ (document.getElementById("receive-box"));

    // Set up the peer connection
    this.#connection = new Connection(this.#baseURI);

    this.#offerButton.onclick = () => this.#connection.offer(this.#id);
    this.#answerButton.onclick = () => this.#connection.answer(this.#id);
    this.#connectButton.onclick = () => this.#connection.connect(this.#id);

    this.#disconnectButton.onclick = () => this.onDisconnect();
    this.#sendButton.onclick = () => this.onSendMessage();

    this.#connection.onreceive = 
        (/** @type {string} */ message) => this.onReceiveMessage(message);
  }

  resizeCanvas() {
    const canvasElement = 
       /** @type {HTMLCanvasElement} */ (document.getElementById("canvas"));
    const dpr = window.devicePixelRatio;
    const width = canvasElement.clientWidth * dpr;
    const height = canvasElement.clientHeight * dpr;

    // Scale the canvas resolution by the device pixel ratio for crisp 
    // rendering on high-DPI displays.
    canvasElement.width = width;
    canvasElement.height = height;

    // 
    this.#model.camera.aspect =
        canvasElement.clientWidth / canvasElement.clientHeight;
    this.#canvas.size =
        new Size2(canvasElement.clientWidth, canvasElement.clientHeight);
    //this.#canvas.dpr = window.devicePixelRatio;

    this.requestRender();
  }

  requestRender() {
    // Only request a new frame if one isn't already requested, to avoid
    // redundant renders. 
    if (!this.#renderRequested) {
      this.#renderRequested = true;

      requestAnimationFrame((timestamp) => {
        // Implement matrix collection from camera
        const modelTransform = this.#model.modelTransform;
        const viewTransform = this.#model.camera.viewTransform;
        const projectionTransform = this.#model.camera.projectionTransform;

        const geometry = this.#model.getGeometry();

        this.#canvas.renderFrame(
          timestamp,
          modelTransform,
          viewTransform,
          projectionTransform,
          geometry
        );

        this.#renderRequested = false;
      });
    }
  }


  onSendMessage() {
    var message = this.#messageInputBox.value;
    this.#connection.send(message);
    this.#messageInputBox.value = "";
    this.#messageInputBox.focus();
  }

  /** @param {string} message */
  onReceiveMessage(message) {
    var element = document.createElement("p");
    var textNode = document.createTextNode(message);
    element.appendChild(textNode);
    this.#receiveBox.appendChild(element);
  }

  onDisconnect() {
    this.#connection.disconnect();
    this.#offerButton.disabled = false;
    this.#answerButton.disabled = false;
    this.#connectButton.disabled = false;
    this.#disconnectButton.disabled = true;
    this.#sendButton.disabled = true;
    this.#messageInputBox.value = "";
    this.#messageInputBox.disabled = true;
  }

  /** @param {string} toolName */
  activateTool(toolName) {
    if (this.#activeTool) {
      this.#activeTool.deactivate();
    }
    // Remove the "active" button look from the previously active tool button.
    if (this.#activeToolButton) {
      this.#activeToolButton.classList.remove('active');
    }

    let toolIcon = null;
    switch (toolName) {
      case 'select':
        this.#activeTool = new Select();
        this.#activeToolButton = this.#selectButton;
        toolIcon = '/modeler/image/select.svg';
        break;
      case 'orbit':
        this.#activeTool = new Orbit(this.#model.camera);
        this.#activeToolButton = this.#orbitButton;
        toolIcon = '/modeler/image/orbit.svg';
        break;
      case 'dolly':
        this.#activeTool = new Dolly(this.#model.camera);
        this.#activeToolButton = this.#dollyButton;
        toolIcon = '/modeler/image/dolly.svg';
        break;
      case 'truck':
        this.#activeTool = new Truck(this.#model.camera);
        this.#activeToolButton = this.#truckButton;
        toolIcon = '/modeler/image/truck.svg';
        break;
      case 'pencil':
        this.#activeTool = new Pencil(this.#model.topology);
        this.#activeToolButton = this.#pencilButton;
        toolIcon = '/modeler/image/pencil.svg';
        break;
      case 'rectangle':
        this.#activeTool = new Rectangle();
        this.#activeToolButton = this.#rectangleButton;
        toolIcon = '/modeler/image/rectangle.svg';
        break;
    }

    if (this.#activeToolButton) {
      this.#activeToolButton.classList.add('active');
    }

    const canvasElement = document.getElementById("canvas");
    if (toolIcon && canvasElement) {
      canvasElement.style.cursor = `url('${toolIcon}') 12 12, auto`;
    }

    if (this.#activeTool) {
      this.#activeTool.activate();
    }
  }

  /** Canvas mouse event handlers - delegate to active tool if it exists
   * @param {MouseEvent} event */
  onCanvasMouseDown(event) {
    if (this.#activeTool) {
      const canvasSize = this.#canvas.size; // in CSS Pixels (not device pixels)
      console.log(`Canvas mouse down at (${event.clientX}, ${event.clientY}), canvas size: (${canvasSize.w}, ${canvasSize.h})`);
      const modelPoint =
          this.#model.camera.screenToWorldOnPlane(event.clientX, event.clientY, 
                                                  canvasSize.w, canvasSize.h);

      console.log(`Mapped to model point: (${modelPoint?.x}, ${modelPoint?.y}, ${modelPoint?.z})`);
      const dirty = this.#activeTool.onMouseDown(modelPoint?.x, modelPoint?.y);
      if (dirty) {
        this.requestRender();
      }
    }
  }
  /** @param {MouseEvent} event */
  onCanvasMouseMove(event) {
    if (this.#activeTool) {
      const dirty = this.#activeTool.onMouseMove(event.clientX, event.clientY);
      if (dirty) {
        this.requestRender();
      }
    }
  }
  /** @param {MouseEvent} event */
  onCanvasMouseUp(event) {
    if (this.#activeTool) {
      const dirty = this.#activeTool.onMouseUp(event.clientX, event.clientY);
      if (dirty) {
        this.requestRender();
      }
    }
  }
}

// Global initialization
const baseURI = document.baseURI;
export const app = new Application(baseURI);


