// @flow

type FormMeta = { id: string, name: string };
type Invoice = { number: string, client: string };

/**
 * Sends service form data to the Apps Script backend.
 *
 * @return {void}
 * @sideEffects Reads the form, calls Apps Script and resets fields.
 */
function sendData(): void {
  const form = document.getElementById("service-form");
  if (!(form instanceof HTMLFormElement)) {
    return;
  }
  const record = Object.fromEntries(new FormData(form).entries());
  google.script.run
    .withSuccessHandler(() => {
      form.reset();
      loadData();
    })
    .withFailureHandler((err) => console.error(err))
    .addServiceRecord(record);
}

/**
 * Loads invoice data from the backend and displays it.
 *
 * @return {void}
 * @sideEffects Writes to the DOM.
 */
function loadData(): void {
  google.script.run
    .withSuccessHandler((data) => {
      const out = document.getElementById("output");
      if (out) {
        out.textContent = JSON.stringify(data, null, 2);
      }
    })
    .withFailureHandler((err) => console.error(err))
    .getInvoicesJSON();
}

/**
 * Hides the default Apps Script UI banner on the page.
 *
 * @return {void}
 * @sideEffects Injects a style element into the DOM.
 */
function hideAppsScriptBar(): void {
  const style = document.createElement("style");
  style.textContent =
    ".powered-by-google, .modal-dialog + div { display:none !important; }";
  document.head.appendChild(style);
}

/**
 * Retrieves metadata describing available forms.
 *
 * @return {Promise<{ forms: Array<FormMeta> }>}
 * @sideEffects None.
 */
function fetchFormMetadata(): Promise<{ forms: Array<FormMeta> }> {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((data) => resolve(data))
      .withFailureHandler((err) => reject(err))
      .getFormMetadata();
  });
}

/**
 * Retrieves a list of recently issued invoices.
 *
 * @return {Promise<Array<Invoice>>}
 * @sideEffects None.
 */
function fetchRecentInvoices(): Promise<Array<Invoice>> {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((data) => resolve(data))
      .withFailureHandler((err) => reject(err))
      .listRecentInvoices();
  });
}

/**
 * Populates the form select element with available forms.
 *
 * @return {Promise<void>}
 * @sideEffects Writes options to the form select element.
 */
async function populateFormSelect(): Promise<void> {
  const select = document.getElementById("service-form");
  if (!select) {
    return;
  }
  try {
    const meta = await fetchFormMetadata();
    meta.forms.forEach((f) => {
      const opt = document.createElement("option");
      opt.value = f.id;
      opt.textContent = f.name;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error(err);
  }
}

/**
 * Inserts recent invoices into the invoice list on the page.
 *
 * @return {Promise<void>}
 * @sideEffects Writes list items to the DOM.
 */
async function populateRecentInvoices(): Promise<void> {
  const list = document.getElementById("recent-invoices");
  if (!list) {
    return;
  }
  try {
    const invoices = await fetchRecentInvoices();
    invoices.forEach((inv) => {
      const item = document.createElement("li");
      item.className = "list-group-item";
      item.textContent = `${inv.number} - ${inv.client}`;
      list.appendChild(item);
    });
  } catch (err) {
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  hideAppsScriptBar();
  void populateFormSelect();
  void populateRecentInvoices();
  const sendBtn = document.getElementById("send-btn");
  if (sendBtn) sendBtn.addEventListener("click", sendData);
  const loadBtn = document.getElementById("load-btn");
  if (loadBtn) loadBtn.addEventListener("click", loadData);
});
