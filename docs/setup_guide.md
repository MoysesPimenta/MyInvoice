# Setup Guide

This guide describes how to set up the Invoice Automation system using Google Sheets and Apps Script.
Ensure that Node.js **20.19.0** is installed locally. Development tools expect a Node version in the range `>=18 <=20`.

## 1. Create the Spreadsheet
1. In Google Drive create a new Google Sheet named **Invoice-Automation**.
2. Open **Extensions → Apps Script** to open the Apps Script editor.

## 2. Copy the Scripts
1. In the Apps Script editor, create a file named `Code.gs` and paste the contents from `invoice_automation_blueprint.md`.
2. Save the script project.

## 3. Authorize Triggers
1. Run the `ensureSheets()` function to initialize sheets and templates.
2. When prompted, grant the following OAuth scopes:
   - `https://www.googleapis.com/auth/spreadsheets`
   - `https://www.googleapis.com/auth/drive`
   - `https://www.googleapis.com/auth/documents`
   - `https://www.googleapis.com/auth/script.container.ui`
3. Set up the following triggers via **Triggers → Add Trigger**:
   - `runMonthlyBilling` – Time-driven, 1st of the month, 02:00.
   - `updateOverdueStatus` – Time-driven, Daily, 01:00.

## 4. Configure Script Properties
1. In the Apps Script editor open **Project Settings → Script Properties**.
2. Add the following key/value pairs:
   - `NFSE_TOKEN` – your PlugNotas API token.
   - `PIX_QR_URL` – URL of the PIX QR code image (optional).

## 5. Test Invoice Cycle
1. Add sample data to the `Clients`, `Machines` and `BillingConfig` sheets.
2. Click **Run → runMonthlyBilling** in the Apps Script editor.
3. Verify that a PDF invoice is generated in your Drive and emailed to the client.

## Screenshots
Include screenshots of the Apps Script editor showing how to add triggers and a GIF of a test invoice run. Save them under the `docs/images` directory.
