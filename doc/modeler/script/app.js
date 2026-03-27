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

    this.offerButton = null;
    this.answerButton = null;
    this.connectButton = null;
    this.disconnectButton = null;
    this.sendButton = null;
    this.messageInputBox = null;
    this.receiveBox = null;
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

    // Set handlers for the buttons.
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
}


