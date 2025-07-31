// @flow

// Example of calling Google Apps Script functions.
// These functions assume the page is running inside an Apps Script web app.

/**
 * Sends a sample payload to the bound Apps Script function.
 *
 * @return {void} Updates the page when the call completes.
 */
function sendData() {
  const payload = { message: "Hello from the client!" };
  // google.script.run will invoke the Apps Script function named 'processData'.
  google.script.run
    .withSuccessHandler(() => {
      const output = document.getElementById("output");
      if (output) {
        output.textContent = "Data sent successfully.";
      }
    })
    .withFailureHandler((err) => {
      const output = document.getElementById("output");
      if (output) {
        output.textContent = "Error: " + err.message;
      }
    })
    .processData(payload);
}

/**
 * Fetches data from the Apps Script backend and displays it.
 *
 * @return {void} Writes the received data to the page.
 */
function loadData() {
  // google.script.run will invoke the Apps Script function named 'fetchData'.
  google.script.run
    .withSuccessHandler((data) => {
      const output = document.getElementById("output");
      if (output) {
        output.textContent = JSON.stringify(data, null, 2);
      }
    })
    .withFailureHandler((err) => {
      const output = document.getElementById("output");
      if (output) {
        output.textContent = "Error: " + err.message;
      }
    })
    .fetchData();
}

// Attach event listeners once DOM is ready.
document.addEventListener("DOMContentLoaded", () => {
  const sendBtn = document.getElementById("send-btn");
  const loadBtn = document.getElementById("load-btn");
  if (sendBtn) {
    sendBtn.addEventListener("click", sendData);
  }
  if (loadBtn) {
    loadBtn.addEventListener("click", loadData);
  }
});
