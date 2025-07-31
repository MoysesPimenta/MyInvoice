// @flow

/**
 * Ensures the onEdit and daily triggers exist.
 */
function ensureTriggers(): void {
  var existing = ScriptApp.getProjectTriggers();
  var hasEdit = existing.some(function (t) {
    return (
      t.getHandlerFunction() === 'onEdit' &&
      t.getEventType() === ScriptApp.EventType.ON_EDIT
    );
  });
  if (!hasEdit) {
    ScriptApp.newTrigger('onEdit')
      .forSpreadsheet(SpreadsheetApp.getActive())
      .onEdit()
      .create();
  }

  var hasDaily = existing.some(function (t) {
    return (
      t.getHandlerFunction() === 'processDaily' &&
      t.getEventType() === ScriptApp.EventType.CLOCK
    );
  });
  if (!hasDaily) {
    ScriptApp.newTrigger('processDaily')
      .timeBased()
      .everyDays(1)
      .atHour(2)
      .create();
  }
}

/**
 * Called on spreadsheet open to add a menu and ensure triggers.
 */
function onOpen(): void {
  SpreadsheetApp.getUi()
    .createMenu('Setup')
    .addItem('Ensure Triggers', 'ensureTriggers')
    .addToUi();
  ensureTriggers();
}

/**
 * Example onEdit handler.
 */
function onEdit(e: GoogleAppsScript.Events.SheetsOnEdit): void {
  // Implement edit reaction here
}

/**
 * Daily processing task.
 */
function processDaily(): void {
  // Implement daily automation here
}

/**
 * Returns JSON data for the requested endpoint.
 */
function doGet(
  e: GoogleAppsScript.Events.DoGet,
): GoogleAppsScript.Content.TextOutput {
  var resource = (e.parameter.resource || '').toLowerCase();
  switch (resource) {
    case 'machines':
      return jsonResponse(loadSheetData_('Machines'));
    case 'services':
      return jsonResponse(loadSheetData_('Services'));
    case 'invoices':
      return jsonResponse(loadSheetData_('Invoices'));
    default:
      return jsonResponse({ error: 'Unknown endpoint' });
  }
}

/**
 * Wraps data in a JSON text output.
 */
function jsonResponse(data: any): GoogleAppsScript.Content.TextOutput {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

/**
 * Loads sheet data as objects using the first row as headers.
 */
function loadSheetData_(sheetName: string): Object[] {
  var sheet = SpreadsheetApp.getActive().getSheetByName(sheetName);
  if (!sheet) return [];
  var values = sheet.getDataRange().getValues();
  if (values.length === 0) return [];
  var headers = values.shift();
  return values.map(function (row) {
    var obj: { [key: string]: any } = {};
    headers.forEach(function (h, idx) {
      obj[h] = row[idx];
    });
    return obj;
  });
}
