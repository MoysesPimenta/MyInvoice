// @flow
/**
 * QUnit tests for Billing functions.
 */
function BillingTestSuite() {
  QUnit.module("Billing");

  QUnit.test("generateInvoicePDF creates PDF link", function (assert) {
    var ss = SpreadsheetApp.getActive();
    ensureSheets();
    var invoices = ss.getSheetByName("Invoices");
    invoices.clearContents();
    invoices.appendRow([
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
    ]);
    var clients = ss.getSheetByName("Clients");
    clients.clearContents();
    clients.appendRow([
      "ClientID",
      "Name",
      "Address",
      "ContactName",
      "ContactPosition",
      "ContactEmail",
      "ContactPhone",
      "TaxID/CNPJ",
      "Export"
    ]);
    clients.appendRow([1, "Test Client", "", "", "", "test@example.com"]);
    invoices.appendRow([
      1,
      1,
      new Date(),
      new Date(),
      new Date(),
      new Date(),
      100,
      "NO",
      "",
      "",
      "",
      "",
      "",
      "[]"
    ]);

    generateInvoicePDF(1, "<table></table>", 100, 1);
    var link = invoices.getRange(2, 11).getValue();
    assert.ok(link, "PDF link should be set");
  });
}
