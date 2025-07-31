// @flow

// Example of calling Google Apps Script functions.
// These functions assume the page is running inside an Apps Script web app.

function callAddService() {
  google.script.run
    .withSuccessHandler(() => {
      const output = document.getElementById("output");
      if (output) {
        output.textContent = "addService executed.";
      }
    })
    .withFailureHandler((err) => {
      const output = document.getElementById("output");
      if (output) {
        output.textContent = "Error: " + err.message;
      }
    })
    .addService();
}

function loadInvoices() {
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
    .getInvoicesJSON();
}

// Attach event listeners once DOM is ready.
document.addEventListener("DOMContentLoaded", () => {
  const serviceBtn = document.getElementById("service-btn");
  const invoicesBtn = document.getElementById("invoices-btn");
  if (serviceBtn) {
    serviceBtn.addEventListener("click", callAddService);
  }
  if (invoicesBtn) {
    invoicesBtn.addEventListener("click", loadInvoices);
  }
});
