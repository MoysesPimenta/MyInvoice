# Deployment Guide

This document explains how to deploy both the front-end and the Apps Script
backend used by **MyInvoice**. Ensure that Node.js `20.19.0` is available
because the tooling relies on Node versions in the range `>=18 <=20`.

## 1. Front-End Deployment

The front-end is a static site located in the `front-end` directory. It can be
served locally during development or hosted on any static hosting platform.

### Local Development

Run the following command from the project root to start a local server:

```bash
npx serve front-end
```

Then open `http://localhost:3000` in your browser.

### Production Hosting

Copy the contents of the `front-end` folder to a static hosting service such as
GitHub Pages, Netlify or your preferred provider. No build step is required.

## 2. Backend Deployment

The backend consists of Google Apps Script files under the `src` directory. Use
[`clasp`](https://github.com/google/clasp) to upload them to your Apps Script
project.

1. Authenticate with your Google account:

   ```bash
   npx clasp login
   ```

2. Deploy the scripts:

   ```bash
   npx clasp push
   ```

3. Open the script editor to verify the upload:

   ```bash
   npx clasp open
   ```

Follow the `setup_guide.md` for details on configuring triggers, script
properties and the Spreadsheet itself.

## 3. Updating After Deployment

Whenever you modify files in `front-end` or `src`, repeat the `clasp push` step
for Apps Script changes or redeploy the static assets for front-end updates.
