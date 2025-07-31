// @flow
/**
 * Utility functions for sheet and document setup.
 * @namespace SheetsUtil
 */

/** @typedef {Object} SheetSpec */

/**
 * Ensures all required sheets exist and have the correct headers.
 *
 * @return {void}
 * @sideEffects Creates sheets and header rows if missing.
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
 *
 * @return {string} Document ID for the template.
 * @sideEffects Creates a Google Doc and stores its ID in properties.
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
 *
 * @return {void}
 * @sideEffects Reads and writes dashboard sheet and inserts charts.
 */
function refreshDashboards() {
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName("Dashboards");
  if (!sheet) {
    return;
  }
  sheet.clearContents();
  sheet.clearCharts();
  sheet
    .getRange("A1")
    .setFormula(
      "=QUERY(Invoices!A:K,\"select year(IssueDate), month(IssueDate), sum(Total) where Paid='YES' group by 1,2 label sum(Total) 'Revenue'\",1)"
    );
  sheet
    .getRange("E1")
    .setFormula(
      "=QUERY(Services!A:J,\"select year(ServiceDate), month(ServiceDate), sum(TotalPrice) where Billed='YES' group by 1,2 label sum(TotalPrice) 'ServiceCosts'\",1)"
    );
  var chart = sheet
    .newChart()
    .setChartType(Charts.ChartType.COLUMN)
    .addRange(sheet.getRange("A1:C12"))
    .setPosition(1, 8, 0, 0)
    .build();
  sheet.insertChart(chart);
}
