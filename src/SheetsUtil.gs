// @flow
/**
 * Utility functions for sheet and document setup.
 * @namespace SheetsUtil
 */

/** @typedef {Object} SheetSpec */

/**
 * Ensures all required sheets exist and have the correct headers.
 */
function ensureSheets() {
  var ss = SpreadsheetApp.getActive();
  var sheetSpecs = {
    Machines: [
      "Serial",
      "Model",
      "ClientID",
      "StorageRate",
      "DateIn",
      "DateOut",
      "Status",
      "LastBilledThrough"
    ],
    Services: [
      "ServiceID",
      "Serial",
      "ClientID",
      "ServiceDate",
      "ServiceType",
      "Description",
      "UnitPrice",
      "QtyHours",
      "TotalPrice",
      "Billed"
    ],
    BillingConfig: ["ServiceType", "UnitPrice", "DefaultTax%"],
    Clients: [
      "ClientID",
      "Name",
      "Address",
      "ContactName",
      "ContactPosition",
      "ContactEmail",
      "ContactPhone",
      "TaxID/CNPJ",
      "Export"
    ],
    Invoices: [
      "InvoiceID",
      "ClientID",
      "PeriodStart",
      "PeriodEnd",
      "IssueDate",
      "DueDate",
      "Total",
      "Paid",
      "PaymentDate",
      "Overdue",
      "PDFLink",
      "NFSeNumber",
      "NFSeType",
      "LineItemsJSON"
    ],
    Dashboards: []
  };
  Object.keys(sheetSpecs).forEach(function (name) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    if (sheet.getLastRow() === 0 && sheetSpecs[name].length > 0) {
      sheet.appendRow(sheetSpecs[name]);
    }
  });
}

/**
 * Creates the invoice template document if not already created.
 * Stores the Doc ID in script properties under 'TEMPLATE_DOC_ID'.
 */
function ensureTemplateDoc() {
  var props = PropertiesService.getScriptProperties();
  var docId = props.getProperty("TEMPLATE_DOC_ID");
  if (docId) {
    return docId;
  }
  var doc = DocumentApp.create("Invoice Template");
  doc
    .getBody()
    .appendParagraph("{{CompanyName}}")
    .setBold(true)
    .setForegroundColor(CONFIG.COLOR_BLUE);
  doc.getBody().appendParagraph("{{LineItemsTable}}");
  doc.saveAndClose();
  docId = doc.getId();
  props.setProperty("TEMPLATE_DOC_ID", docId);
  return docId;
}

/**
 * Refreshes dashboard formulas and charts.
 */
function refreshDashboards() {
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName("Dashboards");
  if (!sheet) {
    return;
  }
  sheet.clearContents();
  sheet
    .getRange("A1")
    .setFormula(
      '=QUERY(Invoices!A:K,"select year(IssueDate), month(IssueDate), sum(Total) where Paid="YES" group by 1,2",1)'
    );
  // Additional formulas and chart generation could be added here.
}
