// @flow
/**
 * Aggregates unbilled items and generates monthly invoices.
 */
function runMonthlyBilling() {
  var ss = SpreadsheetApp.getActive();
  var machinesSheet = ss.getSheetByName("Machines");
  var servicesSheet = ss.getSheetByName("Services");
  var invoicesSheet = ss.getSheetByName("Invoices");
  var clientsSheet = ss.getSheetByName("Clients");

  if (!machinesSheet || !servicesSheet || !invoicesSheet || !clientsSheet) {
    SpreadsheetApp.getUi().alert("Missing sheets. Run ensureSheets first.");
    return;
  }

  var billingDate = new Date();
  var year = billingDate.getFullYear();
  var month = billingDate.getMonth();

  var clients = clientsSheet.getDataRange().getValues();
  var services = servicesSheet.getDataRange().getValues();
  var machines = machinesSheet.getDataRange().getValues();

  var invoiceMap = {};

  // Gather storage charges
  for (var m = 1; m < machines.length; m++) {
    var machine = machines[m];
    if (machine[6] === "stored") {
      var clientId = machine[2];
      var rate = machine[3];
      invoiceMap[clientId] = invoiceMap[clientId] || [];
      invoiceMap[clientId].push({
        description: "Storage for " + machine[0],
        price: rate
      });
      machinesSheet.getRange(m + 1, 8).setValue(billingDate); // LastBilledThrough
    }
  }

  // Gather unbilled services
  for (var s = 1; s < services.length; s++) {
    var svc = services[s];
    if (svc[9] !== "YES") {
      var cId = svc[2];
      invoiceMap[cId] = invoiceMap[cId] || [];
      invoiceMap[cId].push({
        description: svc[5],
        price: svc[8]
      });
      servicesSheet.getRange(s + 1, 10).setValue("YES");
    }
  }

  // Create invoices
  var nextId = invoicesSheet.getLastRow();
  Object.keys(invoiceMap).forEach(function (clientId) {
    var items = invoiceMap[clientId];
    if (!items.length) {
      return;
    }
    var total = 0;
    var table = "<table><tr><th>Desc</th><th>Price</th></tr>";
    for (var i = 0; i < items.length; i++) {
      total += Number(items[i].price);
      table +=
        "<tr><td>" +
        items[i].description +
        "</td><td>" +
        items[i].price +
        "</td></tr>";
    }
    table += "</table>";
    nextId += 1;
    invoicesSheet.appendRow([
      nextId,
      clientId,
      new Date(year, month, 1),
      new Date(year, month + 1, 0),
      billingDate,
      new Date(year, month, billingDate.getDate() + 15),
      total,
      "NO",
      "",
      "",
      "",
      "",
      "",
      JSON.stringify(items)
    ]);
    generateInvoicePDF(nextId, table, total, clientId);
  });
}

/**
 * Generates PDF for invoice and emails the client.
 * @param {number} invoiceId Invoice ID.
 * @param {string} itemsTable HTML table with line items.
 * @param {number} total Total invoice value.
 * @param {string} clientId Client identifier.
 */
function generateInvoicePDF(invoiceId, itemsTable, total, clientId) {
  var ss = SpreadsheetApp.getActive();
  var clientsSheet = ss.getSheetByName("Clients");
  var invoicesSheet = ss.getSheetByName("Invoices");
  var data = clientsSheet.getDataRange().getValues();
  var clientRow;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(clientId)) {
      clientRow = data[i];
      break;
    }
  }
  var invoicesData = invoicesSheet.getDataRange().getValues();
  var invRow;
  var invRowIndex = -1;
  for (var r = 1; r < invoicesData.length; r++) {
    if (String(invoicesData[r][0]) === String(invoiceId)) {
      invRow = invoicesData[r];
      invRowIndex = r + 1; // 1-based sheet row
      break;
    }
  }
  var docId = ensureTemplateDoc();
  var templateFile = DriveApp.getFileById(docId);
  var copy = templateFile.makeCopy("Invoice " + invoiceId);
  var newDoc = DocumentApp.openById(copy.getId());
  var body = newDoc.getBody();
  body.replaceText("{{CompanyName}}", CONFIG.COMPANY_NAME);
  body.replaceText("{{CNPJ}}", CONFIG.CNPJ);
  body.replaceText("{{IM}}", CONFIG.IM);
  body.replaceText("{{InvoiceID}}", String(invoiceId));
  body.replaceText(
    "{{IssueDate}}",
    invRow
      ? Utilities.formatDate(
          invRow[4],
          Session.getScriptTimeZone(),
          "yyyy-MM-dd"
        )
      : ""
  );
  body.replaceText(
    "{{DueDate}}",
    invRow
      ? Utilities.formatDate(
          invRow[5],
          Session.getScriptTimeZone(),
          "yyyy-MM-dd"
        )
      : ""
  );
  body.replaceText("{{Total}}", String(total));
  body.replaceText("{{ClientName}}", clientRow ? clientRow[1] : "");
  body.replaceText("{{ContactName}}", clientRow ? clientRow[3] : "");
  body.replaceText("{{ContactEmail}}", clientRow ? clientRow[5] : "");
  body.replaceText("{{LineItemsTable}}", itemsTable);
  if (CONFIG.PIX_QR_URL) {
    try {
      var img = UrlFetchApp.fetch(CONFIG.PIX_QR_URL).getBlob();
      body.appendImage(img);
    } catch (e) {
      Logger.log("Failed to fetch QR code: " + e);
    }
  }
  newDoc.saveAndClose();
  var pdf = DriveApp.getFileById(copy.getId()).getAs("application/pdf");
  var folder = DriveApp.getFolderById(CONFIG.PDF_FOLDER_ID);
  var saved = folder.createFile(pdf).setName("Invoice-" + invoiceId + ".pdf");
  if (invRowIndex !== -1) {
    invoicesSheet.getRange(invRowIndex, 11).setValue(saved.getUrl());
  }
  MailApp.sendEmail({
    to: clientRow ? clientRow[5] : "",
    subject: "Invoice " + invoiceId,
    htmlBody: "Please find your invoice attached.",
    attachments: [pdf]
  });
}
