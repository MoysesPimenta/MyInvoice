# MyInvoice

![Deploy Pages Status](https://github.com/MoysesPimenta/MyInvoice/actions/workflows/deploy_pages.yml/badge.svg)

This project automates invoice management using Google Apps Script and a simple web front end.
Node.js `20.19.0` is required to ensure compatibility with tooling. Other Node 20 versions may work, but the recommended range is `>=18 <=20`.

## Running the Front‑End Locally

The front end lives in the `front-end` directory. Serve it with any static HTTP server:

```bash
npx serve front-end
```

Then open `http://localhost:3000` in your browser.

## Useful `clasp` Commands

Use the [clasp](https://github.com/google/clasp) tool to manage your Apps Script project:

```bash
npx clasp login        # authenticate with your Google account
npx clasp push         # upload local files to Apps Script
npx clasp open         # open the script editor in your browser
```
