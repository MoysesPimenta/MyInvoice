// @flow
/**
 * App entry point that builds menus and registers triggers.
 *
 * Side effects: modifies the UI menu and may create script triggers.
 *
 * @return {void}
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
 * Registers time-driven triggers for monthly billing and dashboard refresh.
 *
 * Side effects: creates new script triggers in the current project.
 *
 * @return {void}
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
 * Ensures required triggers exist before running automation.
 *
 * Side effects: creates or deletes script triggers.
 *
 * @return {void}
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
 *
 * Side effects: none.
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
 * @return {GoogleAppsScript.Content.TextOutput} JSON output.
 *
 * Side effects: none.
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
