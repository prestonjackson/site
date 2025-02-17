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
  }

  run() {
    console.log("Application run");

    // Set handlers for the buttons.
    const button = document.getElementById("test-button");
    button.onclick = this.onTestButtonClicked;
  }

  onTestButtonClicked() {
    console.log("Test button clicked");
  }
}
