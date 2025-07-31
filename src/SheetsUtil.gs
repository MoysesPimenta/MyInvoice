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
  var sheetSpecs = {};
  sheetSpecs[CONFIG.SHEETS.MACHINES] = [
    "Serial",
    "Model",
    "ClientID",
    "StorageRate",
    "DateIn",
    "DateOut",
    "Status",
    "LastBilledThrough"
  ];
  sheetSpecs[CONFIG.SHEETS.SERVICES] = [
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
  ];
  sheetSpecs[CONFIG.SHEETS.BILLING_CONFIG] = [
    "ServiceType",
    "UnitPrice",
    "DefaultTax%"
  ];
  sheetSpecs[CONFIG.SHEETS.CLIENTS] = [
    "ClientID",
    "Name",
    "Address",
    "ContactName",
    "ContactPosition",
    "ContactEmail",
    "ContactPhone",
    "TaxID/CNPJ",
    "Export"
  ];
  sheetSpecs[CONFIG.SHEETS.INVOICES] = [
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
  ];
  sheetSpecs[CONFIG.SHEETS.DASHBOARDS] = [];

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
  var body = doc.getBody();
  body
    .appendParagraph("{{CompanyName}}")
    .setBold(true)
    .setForegroundColor(CONFIG.COLOR_BLUE);
  body.appendParagraph("CNPJ: {{CNPJ}}  IM: {{IM}}");
  body.appendParagraph("Invoice #{{InvoiceID}}");
  body.appendParagraph("Issue Date: {{IssueDate}}");
  body.appendParagraph("Due Date: {{DueDate}}");
  body.appendParagraph("Client: {{ClientName}}");
  body.appendParagraph("Contact: {{ContactName}} – {{ContactEmail}}");
  body.appendParagraph("{{LineItemsTable}}");
  body.appendParagraph("Total: {{Total}}");
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
  var sheet = ss.getSheetByName(CONFIG.SHEETS.DASHBOARDS);
  if (!sheet) {
    return;
  }
  sheet.clearContents();
  sheet.clearCharts();
  sheet
    .getRange("A1")
    .setFormula(
      "=QUERY(" +
        CONFIG.SHEETS.INVOICES +
        "!A:K,\"select year(IssueDate), month(IssueDate), sum(Total) where Paid='YES' group by 1,2 label sum(Total) 'Revenue'\",1)"
    );
  sheet
    .getRange("E1")
    .setFormula(
      "=QUERY(" +
        CONFIG.SHEETS.SERVICES +
        "!A:J,\"select year(ServiceDate), month(ServiceDate), sum(TotalPrice) where Billed='YES' group by 1,2 label sum(TotalPrice) 'ServiceCosts'\",1)"
    );
  var chart = sheet
    .newChart()
    .setChartType(Charts.ChartType.COLUMN)
    .addRange(sheet.getRange("A1:C12"))
    .setPosition(1, 8, 0, 0)
    .build();
  sheet.insertChart(chart);
}
