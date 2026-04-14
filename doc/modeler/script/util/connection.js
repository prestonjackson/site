// @ts-check
"use strict";

import { Signaler } from "./signaler.js";

export class Connection {
  #baseURI;
  #signaler;
  #connection;
  #channel;

  constructor(baseURI) {
    this.#baseURI = baseURI;

    // The signaling service is required to exchange connection
    // offers and answers and ICE candidates
    this.#signaler = new Signaler(`${this.#baseURI}api/v1/signal`);

    this.#connection = null;   // Peer-to-peer RTCPeerConnection
    this.#channel = null;      // RTCDataChannel for sending/receiving data
 
    this.onreceive = null;
  }

  /** @param {string} id - Connect ID */
  async offer(id) {
    try {
      this.#connection = new RTCPeerConnection();
      this.#channel = this.#connection.createDataChannel("peer-channel");
      this.#channel.onmessage = e => this.onReceiveMessage(e);
      this.#channel.onopen = this.#channel.onclose = e => this.onChannelStatusChange(e);

      this.#connection.onicecandidate = e => {
        if (e.candidate) this.#signaler.postMessage({ id, "offer.ice": e.candidate });
      };

      const offer = await this.#connection.createOffer();
      await this.#connection.setLocalDescription(offer);
      await this.#signaler.postMessage({ id, offer });
    } catch (e) { console.error(`Offer failed: ${e}`); }
  }

  /** @param {string} id - Connect ID */
  async answer(id) {
    try {
      this.#connection = new RTCPeerConnection();
      this.#connection.ondatachannel = e => this.onChannelCallback(e);
      this.#connection.onicecandidate = e => {
        if (e.candidate) this.#signaler.postMessage({ id, "answer.ice": e.candidate });
      };

      const json = await this.#signaler.getMessage();
      const { offer, "offer.ice": ice } = json;

      if (offer) {
        await this.#connection.setRemoteDescription(offer);
        const answer = await this.#connection.createAnswer();
        await this.#connection.setLocalDescription(answer);
        await this.#signaler.postMessage({ id, answer });
        if (ice) await this.#connection.addIceCandidate(new RTCIceCandidate(ice));
      }
    } catch (e) { console.error(`Answer failed: ${e}`); }
  }

  /** @param {string} id - Connect ID */
  async connect(id) {
    try {
      const json = await this.#signaler.getMessage();
      const { answer, "answer.ice": ice } = json;
      if (answer) {
        await this.#connection.setRemoteDescription(answer);
        if (ice) await this.#connection.addIceCandidate(new RTCIceCandidate(ice));
      }
    } catch (e) { console.error(`Connect failed: ${e}`); }
  }

  /** @param {any} data */
  send(data) {
    if (this.#channel?.readyState === "open") this.#channel.send(data);
  }

  onChannelCallback(event) {
    this.#channel = event.channel;
    this.#channel.onmessage = e => this.onReceiveMessage(e);
    this.#channel.onopen = this.#channel.onclose = e => this.onChannelStatusChange(e);
  }

  onReceiveMessage(event) {
    if (this.onreceive) this.onreceive(event.data);
  }

  onChannelStatusChange() {
    if (this.#channel) console.log(`Channel status: ${this.#channel.readyState}`);
  }

  disconnect() {
    this.#channel?.close();
    this.#connection?.close();
    this.#channel = this.#connection = null;
  }
}