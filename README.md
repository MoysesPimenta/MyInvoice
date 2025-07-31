# MyInvoice

This project automates invoice management using Google Apps Script and a simple web front end.
Node.js `20.19.0` is required to ensure compatibility with tooling. Other Node 20 versions may work, but the recommended range is `>=18 <=20`.

The Apps Script portion exposes a global `CONFIG` object for customization. A new
`CONFIG.SHEETS` field lists the spreadsheet tabs used by the system. Refer to
these constants instead of string literals when accessing sheets in code.
