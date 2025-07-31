// @flow

type FormMeta = { id: string, name: string };
type Invoice = { number: string, client: string };

/**
 * Hides the banner injected by the Apps Script iframe.
 *
 * Side effects: appends a style element to the document head.
 */
function hideAppsScriptBar(): void {
  const style = document.createElement("style");
  style.textContent =
    ".powered-by-google, .modal-dialog + div { display:none !important; }";
  document.head.appendChild(style);
}

/**
 * Retrieves the metadata for available service forms from Apps Script.
 *
 * Side effects: performs an RPC to the server.
 *
 * @return {Promise<{ forms: Array<FormMeta> }>} Promise resolving to form
 *     metadata.
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
 * Fetches the list of recently created invoices.
 *
 * Side effects: performs an RPC to the server.
 *
 * @return {Promise<Array<Invoice>>} Promise resolving to invoices.
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
 * Populates the service form selector with options from the server.
 *
 * Side effects: modifies the DOM by adding option elements.
 *
 * @return {Promise<void>}
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
 * Populates the recent invoices list in the UI.
 *
 * Side effects: updates DOM elements with invoice data.
 *
 * @return {Promise<void>}
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
});
