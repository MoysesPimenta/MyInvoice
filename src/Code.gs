/* global SpreadsheetApp, DocumentApp, DriveApp, PropertiesService, UrlFetchApp, GmailApp, Charts */

var CONFIG = {
  COMPANY_NAME: "Devops Consultoria e Desenvolvimento de Softwares LTDA",
  COMPANY_ADDRESS:
    "Av. Paulista, 1636, 15º Andar, CJ 04, São Paulo – SP, 01310-200",
  CNPJ: "54566671000143",
  IM: "13006525",
  PDF_FOLDER_ID: "1roHYH7e5g0CcnLsKa_QWdjnJ0hBmo6Fh",
  COLOR_BLUE: "#003B70",
};

/**
 * Creates invoice template document with merge tags.
 *
 * @return {string} ID of the template document.
 */
function ensureTemplateDoc() {
  var props = PropertiesService.getScriptProperties();
  var templateId = props.getProperty("TEMPLATE_DOC_ID");
  if (templateId) return templateId;

  var doc = DocumentApp.create("Invoice Template");
  var body = doc.getBody();
  body
    .appendParagraph("{{CompanyName}}")
    .setBold(true)
    .setForegroundColor(CONFIG.COLOR_BLUE);
  body.appendParagraph("{{CNPJ}} / {{IM}}");
  body.appendParagraph("Invoice #: {{InvoiceID}}");
  body.appendParagraph("Issue Date: {{IssueDate}}");
  body.appendParagraph("Due Date: {{DueDate}}");
  body.appendParagraph("Client: {{ClientName}}");
  body.appendParagraph("Contact: {{ContactName}} – {{ContactEmail}}");
  body.appendParagraph("{{LineItemsTable}}");
  body.appendParagraph("Total: {{Total}}");
  doc.saveAndClose();

  props.setProperty("TEMPLATE_DOC_ID", doc.getId());
  return doc.getId();
}

/**
 * Generates invoice PDF, inserts optional QR code, saves and emails.
 *
 * @param {Object} invoice Invoice data to merge.
 * @param {string} invoice.ContactEmail Email address for the client.
 * @param {string=} invoice.qrCodeUrl Optional URL with QR code image.
 * @return {string} URL of the saved PDF.
 */
function generateInvoicePDF(invoice) {
  var templateId = ensureTemplateDoc();
  var copyId = DriveApp.getFileById(templateId).makeCopy().getId();
  var doc = DocumentApp.openById(copyId);
  var body = doc.getBody();

  body.replaceText("{{CompanyName}}", CONFIG.COMPANY_NAME);
  body.replaceText("{{CNPJ}}", CONFIG.CNPJ);
  body.replaceText("{{IM}}", CONFIG.IM);
  body.replaceText("{{InvoiceID}}", String(invoice.InvoiceID));
  // prettier-ignore
  body.replaceText("{{IssueDate}}", Utilities.formatDate(invoice.IssueDate, Session.getScriptTimeZone(), "yyyy-MM-dd"));
  // prettier-ignore
  body.replaceText("{{DueDate}}", Utilities.formatDate(invoice.DueDate, Session.getScriptTimeZone(), "yyyy-MM-dd"));
  body.replaceText("{{ClientName}}", invoice.ClientName);
  body.replaceText("{{ContactName}}", invoice.ContactName);
  body.replaceText("{{ContactEmail}}", invoice.ContactEmail);
  body.replaceText("{{Total}}", String(invoice.Total));
  body.replaceText("{{LineItemsTable}}", invoice.LineItemsTable);

  if (invoice.qrCodeUrl) {
    try {
      var blob = UrlFetchApp.fetch(invoice.qrCodeUrl).getBlob();
      body.appendImage(blob);
    } catch (e) {
      console.warn("QR code fetch failed: " + e);
    }
  }

  doc.saveAndClose();

  var pdfBlob = DriveApp.getFileById(copyId).getBlob();
  var folder = DriveApp.getFolderById(CONFIG.PDF_FOLDER_ID);
  var pdfFile = folder
    .createFile(pdfBlob)
    .setName("Invoice-" + invoice.InvoiceID + ".pdf");

  // prettier-ignore
  GmailApp.sendEmail(
    invoice.ContactEmail,
    "Invoice " + invoice.InvoiceID,
    "Please see attached invoice.",
    { attachments: [pdfBlob] }
  );

  DriveApp.getFileById(copyId).setTrashed(true);
  return pdfFile.getUrl();
}

/**
 * Populates Dashboards sheet with formulas and builds charts.
 */
function refreshDashboards() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Dashboards") || ss.insertSheet("Dashboards");
  sheet.clear();

  // prettier-ignore
  sheet.getRange("A1").setFormula("=QUERY(Invoices!A:K,\"select year(IssueDate), month(IssueDate), sum(Total) where Paid='YES' group by 1,2 label sum(Total) 'Revenue'\",1)");
  // prettier-ignore
  sheet.getRange("A5").setFormula('=AVERAGE(IF(Machines!Status="returned", Machines!DateOut - Machines!DateIn))');
  // prettier-ignore
  sheet.getRange("A7").setFormula('=QUERY(Services!A:G,"select Serial, count(ServiceID) group by Serial",1)');
  // prettier-ignore
  sheet.getRange("A10").setFormula('=ARRAYFORMULA(IF(Invoices!Paid="NO", TODAY()-Invoices!DueDate, ))');

  var chart = sheet
    .newChart()
    .setChartType(Charts.ChartType.COLUMN)
    .addRange(sheet.getRange("A1:B13"))
    .setPosition(1, 4, 0, 0)
    .setOption("title", "Revenue per Month")
    .build();
  sheet.insertChart(chart);
}
