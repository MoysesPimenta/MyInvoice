// @flow

type FormMeta = { id: string, name: string };
type Invoice = { number: string, client: string };

/**
 * Hides the Apps Script banner from the embedded page.
 *
 * Side effects: injects a style element into the document head.
 * @returns {void}
 */
function hideAppsScriptBar(): void {
  const style = document.createElement("style");
  style.textContent =
    ".powered-by-google, .modal-dialog + div { display:none !important; }";
  document.head.appendChild(style);
}

/**
 * Retrieves available service forms via Apps Script.
 *
 * Side effects: none.
 * @returns {Promise<{ forms: Array<FormMeta> }>}
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
 * Obtains recently generated invoices from the server.
 *
 * Side effects: none.
 * @returns {Promise<Array<Invoice>>}
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
 * Fills the service form selector with retrieved metadata.
 *
 * Side effects: updates the DOM select element.
 * @returns {Promise<void>}
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
 * Lists the most recent invoices in the UI.
 *
 * Side effects: appends list items to the DOM.
 * @returns {Promise<void>}
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
