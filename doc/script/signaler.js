// Presents an easy to use interface to the Signaling Service.

"use strict";

class Signaler {
  constructor(url) {
    this.url = url;
  }

  async postMessage(data) {
    try {
      const response = await fetch(this.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      // Check if the response status is OK
      if (!response.ok) {
        throw new Error('Response status: ${response.status}');
      }  
    } catch (error) {
      console.error(error.message);
    }
  }

  async getMessage() {
    try {
      const response = await fetch(this.url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      // Check if the response status is OK
      if (!response.ok) {
        throw new Error('Response status: ${response.status}');
      }
    
      // Parse the response body as JSON
      const json = await response.json();
      console.log(json);
      return json;
    } catch (error) {
      console.error(error.message);
    }
  }
}