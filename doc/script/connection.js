// Manages all of the resources and callbacks to set up an RTCPeerConnection

"use strict";

class Connection {
  constructor(baseURI) {
    //console.log("Connection constructor");

    this.baseURI = baseURI;

    // The signaling service is required to exchange connection
    // offers and answers and ICE candidates
    this.signaler = new Signaler(this.baseURI + "api/signal");

    this.connection = null;   // Peer-to-peer RTCPeerConnection
    this.channel = null;       // RTCDataChannel for sending/receiving data
 
    this.onreceive = null;
  }

  // Creates an offer to set up a peer-to-peer connection and sends it to the
  // Signaling server.  
  offer(id) {
    // Create the local connection and its event listeners.
    this.connection = new RTCPeerConnection();
    
    // Create the data channel and establish its event listeners
    this.channel = this.connection.createDataChannel("peer-channel");
    this.channel.onmessage = (event) => this.onReceiveMessage(event);
    this.channel.onopen = (event) => this.onChannelStatusChange(event);
    this.channel.onclose = (event) => this.onChannelStatusChange(event);

    // Set up the ICE candidate listener for the local connection peers.   
    this.connection.onicecandidate = ((event) => {
      if (event.candidate) {
        this.signaler.postMessage({"id": id,
                                   "offer.ice": event.candidate});
      }
    });

    // Now create an offer to connect and send it to the Signaling service.
    // This starts the connection process
    this.connection.createOffer()
      .then((offer) => {
        this.connection.setLocalDescription(offer);
        this.signaler.postMessage({"id": id,
                                   "offer": offer});
      })
      .catch((error) => this.onCreateDescriptionError(error));
  }

  // Creates an answer in response to an offer for a peer-to-peer connection.
  answer(id) {
    // Create the remote connection and its event listeners    
    this.connection = new RTCPeerConnection();

    // Don't create the datachannel object. It will be created for us and
    // shared in the callback.
    this.connection.ondatachannel = (event) => this.onChannelCallback(event);

    // Set up the ICE candidate listner for the remote connection
    this.connection.onicecandidate = ((event) => {
      if (event.candidate) {
        this.signaler.postMessage({"id": id,
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
              this.signaler.postMessage({"id": id,
                                         "answer": answer});
              if (offer_ice) {
                this.connection.addIceCandidate(new RTCIceCandidate(offer_ice))
                  .catch((error) => this.onCreateDescriptionError(error));
              }
            })
        }
      })
      .catch((error) => {
        console.error(error.message);
      });
  }

  // Completes the connection. This should trigger the establishment of the
  // data channel. It will be set to open on both sender and receiver.
  connect(id) {
    this.signaler.getMessage()
      .then((json) => {
        var answer = json["answer"];
        var answer_ice = json["answer.ice"];
        if (answer) {
          this.connection.setRemoteDescription(answer)
            .then(() => {
              if (answer_ice) {
                this.connection.addIceCandidate(new RTCIceCandidate(answer_ice))
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
  
  // Handle an error that occurs during addition of ICE candidate.
  onAddCandidateError(error) {
    this.console.log("addICECandidate failed!");
  }

  // Handles clicks on the "Send" button by transmitting
  // a message to the remote peer.
  send(data) {
    this.channel.send(data);    
  }

  // Called when the connection opens and the data
  // channel is ready to be connected to the remote.
  onChannelCallback(event) {
    this.channel = event.channel;
    this.channel.onmessage = (event) => this.onReceiveMessage(event);
    this.channel.onopen = (event) => this.onChannelStatusChange(event);
    this.channel.onclose = (event) => this.onChannelStatusChange(event);
  }

  // Handle onmessage events for the receiving channel.
  // These are the data messages sent by the sending channel.
  onReceiveMessage(event) {
    this.onreceive(event.data);
  }

  // Handle status changes on the receiver's channel.
  onChannelStatusChange(event) {
    if (this.channel) {
      console.log("Data channel's status has changed to " +
                  this.channel.readyState);
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