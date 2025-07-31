# User Guide

This guide explains how to deploy and operate the invoice automation system.

## Overview
A simple Google Apps Script backend manages clients, machines and monthly invoices. An optional HTML front end provides a basic dashboard for sending and retrieving data.

## One-Click Setup
Use the `setup_guide.md` to create the spreadsheet and copy the Apps Script files. Once the script project is saved, open the project in a terminal and run:

```bash
npx clasp login
npx clasp push
```

The push command uploads all files to your Apps Script project in one step.

## Daily Workflow
1. Open the spreadsheet created during setup.
2. Add new clients or machines in their respective sheets.
3. Click **Run → runMonthlyBilling** to generate invoices on demand.
4. View PDFs in the Drive folder specified in `CONFIG.PDF_FOLDER_ID`.

![Setup step](img/setup1.png)

## NFSe Configuration
Insert your NFSe credentials in `NFSE_TOKEN` inside `Config.gs`. The token is used when the script sends API requests to the São Paulo municipality.

## FAQ
- **Why use Google Apps Script?** It is free and integrates with Drive and Sheets.
- **How do I change invoice templates?** Modify the `Billing` sheet and update `Billing.gs` accordingly.
- **Can I use a custom domain for the front-end?** Yes. Host the `front-end` directory on any static hosting service.

## Changelog
See the project repository releases page for version history.
