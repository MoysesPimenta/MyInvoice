// @flow
/**
 * Issues an NFSe for the given invoice.
 * @param {number} invoiceId Invoice ID to issue NFSe for.
 */
function issueNFSe(invoiceId) {
  if (!invoiceId) {
    SpreadsheetApp.getUi().alert("Invalid invoice ID");
    return;
  }
  var ss = SpreadsheetApp.getActive();
  var invoices = ss.getSheetByName(CONFIG.SHEETS.INVOICES);
  if (!invoices) {
    return;
  }
  var data = invoices.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(invoiceId)) {
      var payload = {
        token: CONFIG.NFSE_TOKEN,
        invoice: data[i]
      };
      var options = {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(payload)
      };
      var response = UrlFetchApp.fetch(
        "https://api.plugnotas.com.br/nfse",
        options
      );
      invoices.getRange(i + 1, 11).setValue(response.getContentText());
      break;
    }
  }
}
