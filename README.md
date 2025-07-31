# MyInvoice

This project automates invoice management using Google Apps Script and a simple web front end.
Node.js `20.19.0` is required to ensure compatibility with tooling. Other Node 20 versions may work, but the recommended range is `>=18 <=20`.

## Running Tests in Apps Script

1. Upload the contents of the `tests/` directory to your Apps Script project.
2. Open the **Extensions → Apps Script** editor from the spreadsheet.
3. Select **QUnit** from the "Select function" dropdown and click **Run**.
4. Check the logs/output panel for test results.
