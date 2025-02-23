"use strict";

function main() {
  // Create and set the global app object.
  const app = new Application();
  window.app = app;

  // Run the top level application logic.
  app.run();
}

class Application {
  constructor() {
    console.log("Application constructor");

    this.offerButton = null;
    this.answerButton = null;
    this.connectButton
    this.disconnectButton = null;
    this.sendButton = null;
    this.messageInputBox = null;
    this.receiveBox = null;

    this.offer = null;
    this.answer = null;

    this.localIceCandidates = [];
    this.remoteIceCandidates = [];
  
    this.localConnection = null;   // RTCPeerConnection for "local" connection
    this.remoteConnection = null;  // RTCPeerConnection for "remote" connection
  
    this.sendChannel = null;       // RTCDataChannel for local (sender)
    this.receiveChannel = null;    // RTCDataChannel for remote (receiver)
  }

  run() {
    console.log("Application run");

    // Set handlers for the buttons.
    this.offerButton = document.getElementById("offer-button");
    this.answerButton = document.getElementById("answer-button");
    this.connectButton = document.getElementById("connect-button");
    this.disconnectButton = document.getElementById("disconnect-button");
    this.sendButton = document.getElementById("send-button");
    this.messageInputBox = document.getElementById("message-input-box");
    this.receiveBox = document.getElementById("receive-box");

    this.offerButton.onclick = this.onOffer;
    this.answerButton.onclick = this.onAnswer;
    this.connectButton.onclick = this.onConnect;
    this.disconnectButton.onclick = this.onDisconnectPeers;
    this.sendButton.onclick = this.onSendMessage;
  }

  onOffer = () => {
    // Create the local connection and its event listeners 
    this.localConnection = new RTCPeerConnection();
      
    // Create the data channel and establish its event listeners
    this.sendChannel = this.localConnection.createDataChannel("sendChannel");
    this.sendChannel.onopen = this.onSendChannelStatusChange;
    this.sendChannel.onclose = this.onSendChannelStatusChange;

    // Set up the ICE candidates for the two peers    
    this.localConnection.onicecandidate = ((event) => {
      if (event.candidate) {
        this.localIceCandidates.push(event.candidate);
      }
    });

    // Now create an offer to connect; this starts the process
    this.localConnection.createOffer()
      .then((offer) => {
        this.localConnection.setLocalDescription(offer);
        this.offer = offer;
      })
      .catch(this.onCreateDescriptionError);
  }

  onAnswer = () => {
    // Create the remote connection and its event listeners    
    this.remoteConnection = new RTCPeerConnection();
    this.remoteConnection.ondatachannel = this.onReceiveChannelCallback;

    this.remoteConnection.onicecandidate = ((event) => {
      if (event.candidate) {
        this.remoteIceCandidates.push(event.candidate);
      }
    })

    if (this.offer) {
      this.remoteConnection.setRemoteDescription(this.offer)
        .then(() => this.remoteConnection.createAnswer())
        .then((answer) => {
          this.remoteConnection.setLocalDescription(answer);
          this.answer = answer;
        })
        .catch(this.onCreateDescriptionError);
    }
  }

  onConnect = () => {
    if (this.answer) {
      this.localConnection.setRemoteDescription(this.answer)
        .then(() => this.localIceCandidates.forEach((candidate) => {
          this.remoteConnection.addIceCandidate(candidate)
            .catch(this.onAddCandidateError);
        }))
        .then(() => this.remoteIceCandidates.forEach((candidate) => {
          this.localConnection.addIceCandidate(candidate)
            .catch(this.onAddCandidateError);
        }))
    }
  }
      
  // Handle errors attempting to create a description;
  // this can happen both when creating an offer and when
  // creating an answer. In this simple example, we handle
  // both the same way.
  onCreateDescriptionError = (error) => {
    console.log("Unable to create an offer: " + error.toString());
  }
  
  // Handle successful addition of the ICE candidate
  // on the "local" end of the connection.
  onLocalAddCandidateSuccess = () => {
    this.offerButton.disabled = true;
  }
  
  // Handle successful addition of the ICE candidate
  // on the "remote" end of the connection.
  onRemoteAddCandidateSuccess = () => {
    this.disconnectButton.disabled = false;
  }
  
  // Handle an error that occurs during addition of ICE candidate.
  onAddCandidateError = () => {
    this.console.log("Oh noes! addICECandidate failed!");
  }

  // Handles clicks on the "Send" button by transmitting
  // a message to the remote peer.
  onSendMessage = () => {
    var message = this.messageInputBox.value;
    this.sendChannel.send(message);
    
    // Clear the input box and re-focus it, so that we're
    // ready for the next message.
    this.messageInputBox.value = "";
    this.messageInputBox.focus();
  }

  // Handle status changes on the local end of the data
  // channel; this is the end doing the sending of data
  // in this example.
  onSendChannelStatusChange = (event) => {
    if (this.sendChannel) {
      var state = this.sendChannel.readyState;

      if (state === "open") {
        this.messageInputBox.disabled = false;
        this.messageInputBox.focus();
        this.sendButton.disabled = false;
        this.disconnectButton.disabled = false;
        this.offerButton.disabled = true;
      } else {
        this.messageInputBox.disabled = true;
        this.sendButton.disabled = true;
        this.offerButton.disabled = false;
        this.disconnectButton.disabled = true;
      }
    }
  }

  // Called when the connection opens and the data
  // channel is ready to be connected to the remote.
  onReceiveChannelCallback = (event) => {
    this.receiveChannel = event.channel;
    this.receiveChannel.onmessage = this.onReceiveMessage;
    this.receiveChannel.onopen = this.onReceiveChannelStatusChange;
    this.receiveChannel.onclose = this.onReceiveChannelStatusChange;
  }

  // Handle onmessage events for the receiving channel.
  // These are the data messages sent by the sending channel.
  onReceiveMessage = (event) => {
    var element = document.createElement("p");
    var textNode = document.createTextNode(event.data);
    
    element.appendChild(textNode);
    this.receiveBox.appendChild(element);
  }

  // Handle status changes on the receiver's channel.
  onReceiveChannelStatusChange = (event) => {
    if (this.receiveChannel) {
      console.log("Receive channel's status has changed to " +
                  this.receiveChannel.readyState);
    }
    // Here you would do stuff that needs to be done
    // when the channel's status changes.
  }

  // Close the connection, including data channels if they're open.
  // Also update the UI to reflect the disconnected status.
  onDisconnectPeers = () =>{
    // Close the RTCDataChannels if they're open.
    this.sendChannel.close();
    this.receiveChannel.close();

    // Close the RTCPeerConnections
    this.localConnection.close();
    this.remoteConnection.close();
    this.sendChannel = null;
    this.receiveChannel = null;
    this.localConnection = null;
    this.remoteConnection = null;

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

class Signaler {
  constructor() {
    console.log("Signaler constructor");
  }

  sendMessage() {
    console.log("Signaler sendMessage");
  }

  onReceiveMessage() {
    console.log("Signaler onReceiveMessage");
  }
}