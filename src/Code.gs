// @flow
/**
 * Builds spreadsheet menus and ensures automation triggers exist.
 *
 * Side effects: modifies the UI and may create triggers.
 * @returns {void}
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
 * Creates time-driven triggers for billing and dashboard refresh.
 *
 * Side effects: adds triggers to the project.
 * @returns {void}
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
 * Verifies required triggers exist and recreates any missing ones.
 *
 * Side effects: may create triggers on the project.
 * @returns {void}
 */
function ensureTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  var hasBilling = false;
  var hasDashboards = false;
  var hasEdit = false;
  triggers.forEach(function (t) {
    if (
      t.getHandlerFunction() === "runMonthlyBilling" &&
      t.getEventType() === ScriptApp.EventType.CLOCK
    ) {
      hasBilling = true;
    }
    if (
      t.getHandlerFunction() === "refreshDashboards" &&
      t.getEventType() === ScriptApp.EventType.CLOCK
    ) {
      hasDashboards = true;
    }
    if (
      t.getHandlerFunction() === "addService" &&
      t.getEventType() === ScriptApp.EventType.ON_EDIT
    ) {
      hasEdit = true;
    }
  });

  if (!hasBilling || !hasDashboards) {
    createTriggers();
  }

  if (!hasEdit) {
    ScriptApp.newTrigger("addService")
      .forSpreadsheet(SpreadsheetApp.getActive())
      .onEdit()
      .create();
  }
}

/**
 * Returns sheet data as JSON.
 * @param {string} name Sheet name.
 * @returns {GoogleAppsScript.Content.TextOutput} JSON output.
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
 * @param {GoogleAppsScript.Events.DoGet} e Event object.
 * @returns {GoogleAppsScript.Content.TextOutput} JSON output.
 *
 * Side effects: reads spreadsheet data.
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
