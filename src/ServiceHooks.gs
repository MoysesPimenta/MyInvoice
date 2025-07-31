// @flow
/**
 * Sheet onEdit hook for Services sheet.
 * @param {GoogleAppsScript.Events.SheetsOnEdit} e Edit event object.
 */
function addService(e) {
  if (
    !e ||
    !e.range ||
    e.range.getSheet().getName() !== CONFIG.SHEETS.SERVICES
  ) {
    return;
  }
  var sheet = e.range.getSheet();
  var row = e.range.getRow();
  var serviceType = sheet.getRange(row, 5).getValue();
  if (!serviceType) {
    return;
  }
  var configSheet = SpreadsheetApp.getActive().getSheetByName(
    CONFIG.SHEETS.BILLING_CONFIG
  );
  if (!configSheet) {
    return;
  }
  var configs = configSheet.getDataRange().getValues();
  for (var i = 1; i < configs.length; i++) {
    if (configs[i][0] === serviceType) {
      sheet.getRange(row, 7).setValue(configs[i][1]); // UnitPrice
      var qty = sheet.getRange(row, 8).getValue() || 1;
      sheet.getRange(row, 9).setValue(qty * configs[i][1]); // TotalPrice
      sheet.getRange(row, 10).setValue("NO"); // Billed
      break;
    }
  }
}
