// Manages all of the resources and callback to set up an RTCPeerConnection

"use strict";

class Connection {
  constructor(baseURI) {
    console.log("Connection constructor");

    this.baseURI = baseURI;
    this.signaler = new Signaler(this.baseURI + "api/signal");

    
    this.connection = null;   // RTCPeerConnection for "local" connection
    this.channel = null;       // RTCDataChannel for local (sender)
 
    this.offerPending = false;
    this.answerPending = false;
  }

  offer() {
    // Create the local connection and its event listeners
    this.connection = new RTCPeerConnection();
    
    // Create the data channel and establish its event listeners
    this.channel = this.connection.createDataChannel("sendChannel");
    this.channel.onopen = (event) => this.onChannelStatusChange(event);
    this.channel.onclose = (event) => this.onChannelStatusChange(event);

    // Set up the ICE candidate listener for the local connection peers    
    this.connection.onicecandidate = ((event) => {
      if (event.candidate) {
        this.signaler.postMessage({"id": this.id,
                                   "offer.ice": event.candidate});
      }
    });

    // Now create an offer to connect; this starts the process
    this.connection.createOffer()
      .then((offer) => {
        this.connection.setLocalDescription(offer);
        this.signaler.postMessage({"id": this.id,
                                   "offer": offer});
      })
      .catch((error) => this.onCreateDescriptionError(error));

    this.offerPending = true;
  }

  answer() {
    // Create the remote connection and its event listeners    
    this.connection = new RTCPeerConnection();
    this.connection.ondatachannel = (event) => this.onChannelCallback(event);

    // Set up the ICE candidate listner for the remote connection
    this.connection.onicecandidate = ((event) => {
      if (event.candidate) {
        this.signaler.postMessage({"id": this.id,
                                   "answer.ice": event.candidate});
      }
    })

    // Get the offer from the signaler
    this.signaler.getMessage()
      .then((json) => {
        var offer = json["offer"];
        var offer_ice = json["offer.ice"]
        if (offer) {
          this.connection.setRemoteDescription(offer)
            .then(() => this.connection.createAnswer())
            .then((answer) => {
              this.connection.setLocalDescription(answer);
              this.signaler.postMessage({"id": this.id,
                                         "answer": answer});
              if (offer_ice) {
                this.addIceCandidate(new RTCIceCandidate(offer_ice))
                  .catch((error) => this.onCreateDescriptionError(error));
              }
            })
        }
      })
      .catch((error) => {
        console.error(error.message);
      });
  }

  connect() {
    this.signaler.getMessage()
      .then((json) => {
        var answer = json["answer"];
        var answer_ice = json["answer.ice"];
        if (answer) {
          this.connection.setRemoteDescription(answer)
            .then(() => {
              if (answer_ice) {
                this.addIceCandidate(new RTCIceCandidate(answer_ice))
                  .catch((error) => this.onAddCandidateError(error));
              }
            });
        }
      });
  }
      
  // Handle errors attempting to create a description;
  // this can happen both when creating an offer and when
  // creating an answer. In this simple example, we handle
  // both the same way.
  onCreateDescriptionError(error) {
    console.log("Unable to create an offer: " + error.toString());
  }
  
  // Handle successful addition of the ICE candidate
  // on the "remote" end of the connection.
  onAddCandidateSuccess() {
    this.disconnectButton.disabled = false;
  }
  
  // Handle an error that occurs during addition of ICE candidate.
  onAddCandidateError(error) {
    this.console.log("Oh noes! addICECandidate failed!");
  }

  // Handles clicks on the "Send" button by transmitting
  // a message to the remote peer.
  onSendMessage() {
    var message = this.messageInputBox.value;
    this.channel.send(message);
    
    // Clear the input box and re-focus it, so that we're
    // ready for the next message.
    this.messageInputBox.value = "";
    this.messageInputBox.focus();
  }

  // Called when the connection opens and the data
  // channel is ready to be connected to the remote.
  onChannelCallback(event) {
    this.channel = event.channel;
    this.channel.onmessage = (event) => this.onReceiveMessage(event);
    this.channel.onopen = (event) => this.onReceiveChannelStatusChange(event);
    this.channel.onclose = (event) => this.onReceiveChannelStatusChange(event);
  }

  // Handle onmessage events for the receiving channel.
  // These are the data messages sent by the sending channel.
  onReceiveMessage(event) {
    var element = document.createElement("p");
    var textNode = document.createTextNode(event.data);
    
    element.appendChild(textNode);
    this.receiveBox.appendChild(element);
  }

  // Handle status changes on the receiver's channel.
  onChannelStatusChange(event) {
    if (this.receiveChannel) {
      console.log("Receive channel's status has changed to " +
                  this.receiveChannel.readyState);
    }
    // Here you would do stuff that needs to be done
    // when the channel's status changes.
  }

  // Close the connection, including data channels if they're open.
  // Also update the UI to reflect the disconnected status.
  disconnect() {
    // Close the RTCDataChannels if they're open.
    this.channel.close();
    this.channel = null;

    // Close the RTCPeerConnections
    this.connection.close();
    this.connection = null;
  }
}