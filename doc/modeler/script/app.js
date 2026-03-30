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
    this.activeTool = null;

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
  }

  run() {
    console.log("Application run");

    // Set up the canvas with WebGPU
    const canvasElement = document.getElementById("canvas");
    this.canvas = new Canvas(canvasElement);
    this.canvas.initialize().catch(err => {
      console.error("Failed to initialize canvas:", err);
    });

    // Set up the peer connection
    this.connection =  new Connection(this.baseURI);

    // Set handlers for the toolbar buttons.
    this.truckButton = document.getElementById("truck-button");
    this.dollyButton = document.getElementById("dolly-button");
    this.orbitButton = document.getElementById("orbit-button");

    this.truckButton.onclick = () => this.activateTool('truck');
    this.dollyButton.onclick = () => this.activateTool('dolly');
    this.orbitButton.onclick = () => this.activateTool('orbit');

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
    canvasElement.addEventListener('mousedown', (e) => this.onCanvasMouseDown(e));
    canvasElement.addEventListener('mousemove', (e) => this.onCanvasMouseMove(e));
    canvasElement.addEventListener('mouseup', (e) => this.onCanvasMouseUp(e));

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
  // @param {string} toolName - The name of the tool to activate ('truck', 'dolly', or 'orbit')
  activateTool(toolName) {
    // Deactivate current tool if one is active
    if (this.activeTool) {
      this.activeTool.deactivate();
    }

    // Create and activate the new tool
    switch(toolName) {
      case 'truck':
        this.activeTool = new Truck();
        break;
      case 'dolly':
        this.activeTool = new Dolly();
        break;
      case 'orbit':
        this.activeTool = new Orbit();
        break;
      default:
        console.warn(`Unknown tool: ${toolName}`);
        this.activeTool = null;
        return;
    }

    this.activeTool.activate();
  }

  // Forward mouse down events to the active tool
  onCanvasMouseDown(event) {
    if (this.activeTool) {
      this.activeTool.onMouseDown(event);
    }
  }

  // Forward mouse move events to the active tool
  onCanvasMouseMove(event) {
    if (this.activeTool) {
      this.activeTool.onMouseMove(event);
    }
  }

  // Forward mouse up events to the active tool
  onCanvasMouseUp(event) {
    if (this.activeTool) {
      this.activeTool.onMouseUp(event);
    }
  }
}


