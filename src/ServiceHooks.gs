// @flow
/**
 * Sheet onEdit hook for Services sheet.
 * @param {GoogleAppsScript.Events.SheetsOnEdit} e Edit event object.
 */
function addService(e) {
  if (!e || !e.range || e.range.getSheet().getName() !== "Services") {
    return;
  }
  var sheet = e.range.getSheet();
  var row = e.range.getRow();
  var serviceType = sheet.getRange(row, 5).getValue();
  if (!serviceType) {
    return;
  }
  var configSheet = SpreadsheetApp.getActive().getSheetByName("BillingConfig");
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

/**
 * Adds a new service record from the web front-end.
 * @param {Object} svc Service data from the form.
 */
function addServiceRecord(svc) {
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName("Services");
  if (!sheet) {
    return;
  }
  var row = sheet.getLastRow() + 1;
  sheet.appendRow([
    svc.ServiceID || "",
    svc.Serial || "",
    svc.ClientID || "",
    svc.ServiceDate ? new Date(svc.ServiceDate) : new Date(),
    svc.ServiceType || "",
    svc.Description || "",
    "",
    svc.QtyHours || 1,
    "",
    ""
  ]);
  var configSheet = ss.getSheetByName("BillingConfig");
  if (!configSheet) {
    return;
  }
  var configs = configSheet.getDataRange().getValues();
  for (var i = 1; i < configs.length; i++) {
    if (configs[i][0] === svc.ServiceType) {
      sheet.getRange(row, 7).setValue(configs[i][1]);
      var qty = svc.QtyHours || 1;
      sheet.getRange(row, 9).setValue(qty * configs[i][1]);
      sheet.getRange(row, 10).setValue("NO");
      break;
    }
  }
}
