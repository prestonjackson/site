"use strict";

function main(baseURI) {
  // Create and set the global app object.
  const app = new Application(baseURI);
  window.app = app;

  // Run the top level application logic.
  app.run();
}

class Application {
  constructor(baseURI) {
    console.log("Application constructor");

    this.baseURI = baseURI;
    this.id = "abcd";

    this.connection = null;

    this.canvas = null;

    this.model = null;

    this.activeTool = null;
    this.activeToolButton = null;

    this.offerButton = null;
    this.answerButton = null;
    this.connectButton = null;
    this.disconnectButton = null;
    this.sendButton = null;
    this.messageInputBox = null;
    this.receiveBox = null;

    this.truckButton = null;
    this.dollyButton = null;
    this.orbitButton = null;
    this.selectButton = null;
    this.pencilButton = null;
    this.rectangleButton = null;
    this.ovalButton = null;
  }

  run() {
    console.log("Application run");

    // Create a model to hold geometric data
    // For now, we'll initialize it with a simple triangle to test
    this.model = new Model();
    
    // Add some test geometry
    const v0 = this.model.addVertex(new Point(-0.5, -0.5, 0));
    const v1 = this.model.addVertex(new Point(0.5, -0.5, 0));
    const v2 = this.model.addVertex(new Point(0, 0.5, 0));
    const e0 = this.model.addEdge([v0, v1]);
    const e1 = this.model.addEdge([v1, v2]);
    const e2 = this.model.addEdge([v2, v0]);
    const f0 = this.model.addFace([e0, e1, e2]);

    // Set up the canvas with WebGPU
    const canvasElement = document.getElementById("canvas");
    this.canvas = new Canvas(canvasElement);
    this.canvas.initialize().catch(err => {
      console.error("Failed to initialize canvas:", err);
    });

    // Set handlers for the toolbar buttons.
    this.selectButton = document.getElementById("select-button");
    this.orbitButton = document.getElementById("orbit-button");
    this.dollyButton = document.getElementById("dolly-button");
    this.truckButton = document.getElementById("truck-button");
    this.pencilButton = document.getElementById("pencil-button");
    this.rectangleButton = document.getElementById("rectangle-button");
    this.ovalButton = document.getElementById("oval-button");

    this.selectButton.onclick = () => this.activateTool('select');
    this.orbitButton.onclick = () => this.activateTool('orbit');
    this.dollyButton.onclick = () => this.activateTool('dolly');
    this.truckButton.onclick = () => this.activateTool('truck');
    this.pencilButton.onclick = () => this.activateTool('pencil');
    this.rectangleButton.onclick = () => this.activateTool('rectangle');
    this.ovalButton.onclick = () => this.activateTool('oval');

    // Set up the peer connection
    this.connection =  new Connection(this.baseURI);

    // Set handlers for the control buttons.
    this.offerButton = document.getElementById("offer-button");
    this.answerButton = document.getElementById("answer-button");
    this.connectButton = document.getElementById("connect-button");
    this.disconnectButton = document.getElementById("disconnect-button");
    this.sendButton = document.getElementById("send-button");
    this.messageInputBox = document.getElementById("message-input-box");
    this.receiveBox = document.getElementById("receive-box");

    this.offerButton.onclick = () => this.connection.offer(this.id);
    this.answerButton.onclick = () => this.connection.answer(this.id);
    this.connectButton.onclick = () => this.connection.connect(this.id);

    this.disconnectButton.onclick = () => this.onDisconnect();
    this.sendButton.onclick = () => this.onSendMessage();

    this.connection.onreceive = (message) => this.onReceiveMessage(message);

    // Register canvas mouse event listeners.
    canvasElement.addEventListener('mousedown',
        (e) => this.onCanvasMouseDown(e));
    canvasElement.addEventListener('mousemove',
        (e) => this.onCanvasMouseMove(e));
    canvasElement.addEventListener('mouseup',
        (e) => this.onCanvasMouseUp(e));

    // Set up the canvas, get the resolution correct.
    window.addEventListener("resize", () => this.resizeCanvas());
    this.resizeCanvas();
  }

  // Resize the canvas to fit its container.
  resizeCanvas() {
    const canvasElement = document.getElementById("canvas");
    const dpr = window.devicePixelRatio || 1;
    canvasElement.width = canvasElement.clientWidth * dpr;
    canvasElement.height = canvasElement.clientHeight * dpr;
  }

  requestRender() {
    if (!this.renderRequested) {
      this.renderRequested = true;
      requestAnimationFrame((timestamp) => {
        const modelMatrix = this.model.getModelMatrix();
        const viewMatrix = this.model.camera.getViewMatrix();
        const projectionMatrix = this.model.camera.getProjectionMatrix();

        const vertices = this.model.topology.vertices;
        const edges = this.model.topology.edges;
        const faces = this.model.topology.faces;

        this.canvas.drawFrame(timestamp,
            modelMatrix, viewMatrix, projectionMatrix,
            vertices, edges, faces
        );
        this.renderRequested = false;
      });
    } 
  }

  // Handles clicks on the "Send" button by transmitting
  // a message to the remote peer.
  onSendMessage() {
    var message = this.messageInputBox.value;
    this.connection.send(message);
    
    // Clear the input box and re-focus it, so that we're
    // ready for the next message.
    this.messageInputBox.value = "";
    this.messageInputBox.focus();
  }

  // Handle onmessage events for the receiving channel.
  // These are the data messages sent by the sending channel.
  onReceiveMessage(message) {
    var element = document.createElement("p");
    var textNode = document.createTextNode(message);
    
    element.appendChild(textNode);
    this.receiveBox.appendChild(element);
  }

  // Handle status changes on the receiver's channel.
  onReceiveChannelStatusChange(event) {
    if (this.receiveChannel) {
      console.log("Receive channel's status has changed to " +
                  this.receiveChannel.readyState);
    }
    // Here you would do stuff that needs to be done
    // when the channel's status changes.
  }

  // Close the connection, including data channels if they're open.
  // Also update the UI to reflect the disconnected status.
  onDisconnect() {
    // Close the RTCPeerConnections
    this.connection.disconnect();

    // Update user interface elements
    this.offerButton.disabled = false;
    this.answerButton.disabled = false;
    this.connectButton.disabled = false;
    this.disconnectButton.disabled = true;
    this.sendButton.disabled = true;
 
    this.messageInputBox.value = "";
    this.messageInputBox.disabled = true;
  }

  // Activate a tool by name. Deactivates the current tool and creates a new one.
  // @param {string} toolName - The name of the tool to activate ('select', 'orbit', 'dolly', 'truck', 'pencil', 'rectangle', or 'oval')
  activateTool(toolName) {
    // Deactivate current tool and button
    if (this.activeTool) {
      this.activeTool.deactivate();
    }
    if (this.activeToolButton) {
      this.activeToolButton.classList.remove('active');
    }

    // Create and activate the new tool
    let toolIcon = null;
    switch(toolName) {
      case 'select':
        this.activeTool = new Select();
        this.activeToolButton = this.selectButton;
        toolIcon = '/modeler/image/select.svg';
        break;
      case 'orbit':
        this.activeTool = new Orbit();
        this.activeToolButton = this.orbitButton;
        toolIcon = '/modeler/image/orbit.svg';
        break;
      case 'dolly':
        this.activeTool = new Dolly();
        this.activeToolButton = this.dollyButton;
        toolIcon = '/modeler/image/dolly.svg';
        break;
      case 'truck':
        this.activeTool = new Truck();
        this.activeToolButton = this.truckButton;
        toolIcon = '/modeler/image/truck.svg';
        break;
      case 'pencil':
        this.activeTool = new Pencil();
        this.activeToolButton = this.pencilButton;
        toolIcon = '/modeler/image/pencil.svg';
        break;
      case 'rectangle':
        this.activeTool = new Rectangle();
        this.activeToolButton = this.rectangleButton;
        toolIcon = '/modeler/image/rectangle.svg';
        break;
      case 'oval':
        this.activeTool = new Oval();
        this.activeToolButton = this.ovalButton;
        toolIcon = '/modeler/image/oval.svg';
        break;
      default:
        console.warn(`Unknown tool: ${toolName}`);
        this.activeTool = null;
        this.activeToolButton = null;
        return;
    }

    // Highlight the active button
    this.activeToolButton.classList.add('active');

    // Set custom cursor
    const canvasElement = document.getElementById("canvas");
    if (toolIcon && canvasElement) {
      canvasElement.style.cursor = `url('${toolIcon}') 12 12, auto`;
    }

    this.activeTool.activate();
  }

  // Forward mouse down events to the active tool
  onCanvasMouseDown(event) {
    if (this.activeTool) {
      const dirty = this.activeTool.onMouseDown(event);
      if (dirty) {
        this.requestRender();
      }
    }
  }

  // Forward mouse move events to the active tool
  onCanvasMouseMove(event) {
    if (this.activeTool) {
      const dirty = this.activeTool.onMouseMove(event);
      if (dirty) {
        this.requestRender();
      }
    }
  }

  // Forward mouse up events to the active tool
  onCanvasMouseUp(event) {
    if (this.activeTool) {
      const dirty = this.activeTool.onMouseUp(event);
      if (dirty) {
        this.requestRender();
      }
    }
  }
}


