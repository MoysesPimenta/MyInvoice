// @flow
/**
 * App entry point. Builds custom menus and ensures triggers exist.
 *
 * @return {void}
 * @sideEffects Creates menus and triggers in the active spreadsheet.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Setup")
    .addItem("Ensure Sheets", "ensureSheets")
    .addItem("Ensure Template Doc", "ensureTemplateDoc")
    .addItem("Refresh Dashboards", "refreshDashboards")
    .addToUi();
  SpreadsheetApp.getUi()
    .createMenu("Operations")
    .addItem("Run Monthly Billing", "runMonthlyBilling")
    .addItem("Issue NFSe", "issueNFSe")
    .addToUi();
  ensureTriggers();
}

/**
 * Registers time-driven triggers used by the automation.
 *
 * @return {void}
 * @sideEffects Creates new project triggers.
 */
function createTriggers() {
  ScriptApp.newTrigger("runMonthlyBilling")
    .timeBased()
    .onMonthDay(1)
    .atHour(2)
    .create();
  ScriptApp.newTrigger("refreshDashboards")
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(3)
    .create();
}

/**
 * Ensures required triggers exist and removes duplicates.
 *
 * @return {void}
 * @sideEffects Creates and deletes project triggers.
 */
function ensureTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  var existing = {};
  triggers.forEach(function (t) {
    var key = t.getHandlerFunction() + "|" + t.getEventType();
    if (existing[key]) {
      ScriptApp.deleteTrigger(t);
    } else {
      existing[key] = t;
    }
  });

  if (!existing["runMonthlyBilling|" + ScriptApp.EventType.CLOCK]) {
    ScriptApp.newTrigger("runMonthlyBilling")
      .timeBased()
      .onMonthDay(1)
      .atHour(2)
      .create();
  }

  if (!existing["refreshDashboards|" + ScriptApp.EventType.CLOCK]) {
    ScriptApp.newTrigger("refreshDashboards")
      .timeBased()
      .onWeekDay(ScriptApp.WeekDay.MONDAY)
      .atHour(3)
      .create();
  }

  if (!existing["addService|" + ScriptApp.EventType.ON_EDIT]) {
    ScriptApp.newTrigger("addService")
      .forSpreadsheet(SpreadsheetApp.getActive())
      .onEdit()
      .create();
  }
}

/**
 * Returns sheet data as JSON.
 * @param {string} name Sheet name.
 * @return {GoogleAppsScript.Content.TextOutput} JSON output.
 * @private
 */
function sheetToJson_(name) {
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    return ContentService.createTextOutput("[]").setMimeType(
      ContentService.MimeType.JSON
    );
  }
  var data = sheet.getDataRange().getValues();
  if (data.length === 0) {
    return ContentService.createTextOutput("[]").setMimeType(
      ContentService.MimeType.JSON
    );
  }
  var headers = data.shift();
  var obj = data.map(function (row) {
    var out = {};
    headers.forEach(function (h, i) {
      out[String(h)] = row[i];
    });
    return out;
  });
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

/**
 * Main GET handler returning JSON for project endpoints.
 *
 * @param {GoogleAppsScript.Events.DoGet} e Event object.
 * @return {GoogleAppsScript.Content.TextOutput} JSON output.
 * @sideEffects None.
 */
function doGet(e) {
  var path = e && e.pathInfo ? String(e.pathInfo).replace(/^\//, "") : "";
  switch (path) {
    case "machines":
      return sheetToJson_("Machines");
    case "services":
      return sheetToJson_("Services");
    case "invoices":
      return sheetToJson_("Invoices");
    default:
      return ContentService.createTextOutput("{}").setMimeType(
        ContentService.MimeType.JSON
      );
  }
}

/**
 * Returns invoices data as JSON for the web front-end.
 *
 * @return {GoogleAppsScript.Content.TextOutput} JSON output.
 * @sideEffects None.
 */
function getInvoicesJSON() {
  return sheetToJson_("Invoices");
}

/**
 * Returns metadata for available service forms.
 *
 * @return {{forms: Array<{id: string, name: string}>}}
 * @sideEffects None.
 */
function getFormMetadata() {
  return { forms: [{ id: "service", name: "Service Entry" }] };
}

/**
 * Lists the five most recent invoices for the dashboard.
 *
 * @return {Array<{number: string, client: string}>}
 * @sideEffects Reads spreadsheet data.
 */
function listRecentInvoices() {
  var sheet = SpreadsheetApp.getActive().getSheetByName("Invoices");
  if (!sheet) {
    return [];
  }
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return [];
  }
  data.shift();
  return data.slice(-5).map(function (row) {
    return { number: String(row[0]), client: row[1] };
  });
}
