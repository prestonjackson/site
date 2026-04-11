// @ts-check
import { Model } from "./model/model.js";
import { Canvas } from "./gfx/canvas.js";
import { Connection } from "./util/connection.js";
import { Select } from "./tool/select.js";
import { Orbit } from "./tool/orbit.js";
import { Dolly } from "./tool/dolly.js";
import { Truck } from "./tool/truck.js";
import { Pencil } from "./tool/pencil.js";
import { Rectangle } from "./tool/rectangle.js";
import { Oval } from "./tool/oval.js";

/** @import { Tool } from "./tool/tool.js" */

/**
 * Application - The main controller class for the Modeler application.
 * Manages the lifecycle of the Model, Canvas, and Tool system.
 */
class Application {
  /** @type {string} */
  #baseURI;
  /** @type {string} */
  #id;
  /** @type {Connection?} */
  #connection;
  /** @type {Canvas?} */
  #canvas;
  /** @type {Model?} */
  #model;
  /** @type {any} */
  #activeTool; // Typed as any because all tools extend Tool but have different signatures
  /** @type {HTMLElement?} */
  #activeToolButton;
  /** @type {boolean} */
  #renderRequested = false;

  /** @type {HTMLButtonElement?} */
  #offerButton;
  /** @type {HTMLButtonElement?} */
  #answerButton;
  /** @type {HTMLButtonElement?} */
  #connectButton;
  /** @type {HTMLButtonElement?} */
  #disconnectButton;
  /** @type {HTMLButtonElement?} */
  #sendButton;
  /** @type {HTMLInputElement?} */
  #messageInputBox;
  /** @type {HTMLElement?} */
  #receiveBox;

  /** @type {HTMLElement?} */
  #truckButton;
  /** @type {HTMLElement?} */
  #dollyButton;
  /** @type {HTMLElement?} */
  #orbitButton;
  /** @type {HTMLElement?} */
  #selectButton;
  /** @type {HTMLElement?} */
  #pencilButton;
  /** @type {HTMLElement?} */
  #rectangleButton;
  /** @type {HTMLElement?} */
  #ovalButton;

  /** @param {string} baseURI */
  constructor(baseURI) {
    this.#baseURI = baseURI;
    this.#id = "abcd";

    this.#connection = null;
    this.#canvas = null;
    this.#model = null;
    this.#activeTool = null;
    this.#activeToolButton = null;
  }

  run() {
    // Create a model to hold geometric data
    this.#model = new Model();
    this.#model.insertTestGeometry();

    // Set up the canvas with WebGPU
    const canvasElement = document.getElementById("canvas");
    const context = canvasElement.getContext("webgpu");
    if (!context) {
      console.error("WebGPU context not available");
    }
    this.#canvas = new Canvas(context);
    this.#canvas.initialize().catch(err => {
      console.error("Failed to initialize canvas:", err);
    });

    // Register canvas mouse event listeners.
    canvasElement.addEventListener('mousedown', (e) => this.onCanvasMouseDown(e));
    canvasElement.addEventListener('mousemove', (e) => this.onCanvasMouseMove(e));
    canvasElement.addEventListener('mouseup', (e) => this.onCanvasMouseUp(e));

    // Set up the canvas resolution.
    window.addEventListener("resize", () => this.resizeCanvas());
    this.resizeCanvas();

    // Set up the peer connection
    this.#connection = new Connection(this.#baseURI);

    // Set handlers for the toolbar buttons.
    this.#selectButton = document.getElementById("select-button");
    this.#orbitButton = document.getElementById("orbit-button");
    this.#dollyButton = document.getElementById("dolly-button");
    this.#truckButton = document.getElementById("truck-button");
    this.#pencilButton = document.getElementById("pencil-button");
    this.#rectangleButton = document.getElementById("rectangle-button");
    this.#ovalButton = document.getElementById("oval-button");

    this.#selectButton.onclick = () => this.activateTool('select');
    this.#orbitButton.onclick = () => this.activateTool('orbit');
    this.#dollyButton.onclick = () => this.activateTool('dolly');
    this.#truckButton.onclick = () => this.activateTool('truck');
    this.#pencilButton.onclick = () => this.activateTool('pencil');
    this.#rectangleButton.onclick = () => this.activateTool('rectangle');
    this.#ovalButton.onclick = () => this.activateTool('oval');

    // Set handlers for the control buttons.
    this.#offerButton = document.getElementById("offer-button");
    this.#answerButton = document.getElementById("answer-button");
    this.#connectButton = document.getElementById("connect-button");
    this.#disconnectButton = document.getElementById("disconnect-button");
    this.#sendButton = document.getElementById("send-button");
    this.#messageInputBox = document.getElementById("message-input-box");
    this.#receiveBox = document.getElementById("receive-box");

    this.#offerButton.onclick = () => this.#connection.offer(this.#id);
    this.#answerButton.onclick = () => this.#connection.answer(this.#id);
    this.#connectButton.onclick = () => this.#connection.connect(this.#id);

    this.#disconnectButton.onclick = () => this.onDisconnect();
    this.#sendButton.onclick = () => this.onSendMessage();

    this.#connection.onreceive = (message) => this.onReceiveMessage(message);
  }

  resizeCanvas() {
    const canvasElement = document.getElementById("canvas");
    const dpr = window.devicePixelRatio || 1;
    canvasElement.width = canvasElement.clientWidth * dpr;
    canvasElement.height = canvasElement.clientHeight * dpr;
  }

  requestRender() {
    if (!this.#renderRequested) {
      this.#renderRequested = true;
      requestAnimationFrame((timestamp) => {
        // Implement matrix collection from camera
        const viewMatrix = this.#model.camera.getViewMatrix();
        const projectionMatrix = this.#model.camera.getProjectionMatrix();

        const vertices = this.#model.topology.vertices;
        const edges = this.#model.topology.edges;
        const faces = this.#model.topology.faces;

        this.#canvas.drawFrame(timestamp,
          null, // modelMatrix
          viewMatrix,
          projectionMatrix,
          vertices, edges, faces
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

  activateTool(toolName) {
    if (this.#activeTool) {
      this.#activeTool.deactivate();
    }
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
        this.#activeTool = new Pencil(this.#model);
        this.#activeToolButton = this.#pencilButton;
        toolIcon = '/modeler/image/pencil.svg';
        break;
      case 'rectangle':
        this.#activeTool = new Rectangle();
        this.#activeToolButton = this.#rectangleButton;
        toolIcon = '/modeler/image/rectangle.svg';
        break;
      case 'oval':
        this.#activeTool = new Oval();
        this.#activeToolButton = this.#ovalButton;
        toolIcon = '/modeler/image/oval.svg';
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

  onCanvasMouseDown(event) {
    if (this.#activeTool) {
      const dirty = this.#activeTool.onMouseDown(event);
      if (dirty) this.requestRender();
    }
  }

  onCanvasMouseMove(event) {
    if (this.#activeTool) {
      const dirty = this.#activeTool.onMouseMove(event);
      if (dirty) this.requestRender();
    }
  }

  onCanvasMouseUp(event) {
    if (this.#activeTool) {
      const dirty = this.#activeTool.onMouseUp(event);
      if (dirty) this.requestRender();
    }
  }
}

// Global initialization
const baseURI = document.baseURI;
const app = new Application(baseURI);
window.app = app;
app.run();


