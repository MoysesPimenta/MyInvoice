# **Free Cloud Invoice & Storage Management App – Complete Blueprint**

> **Objective**  
> Build a **100 % free**, cloud‑hosted system that:  
> 1. Tracks computers sent for **storage** and **services**.  
> 2. Automates **monthly invoicing** (PDF + NFSe for São Paulo).  
> 3. Provides live **dashboards** (revenue, profit, turnaround).  
> 4. Runs entirely on **Google Workspace free tier** (Sheets + Apps Script).  
> 5. Can be extended with a free front‑end (optional).

---

## 1  Architecture Overview

```text
┌──────────────┐   OAuth2 / REST   ┌────────────────────────┐
│  Front‑End   │ ⟵⟶ (optional) ⟵⟶ │  Google Apps Script API │
│   (HTML/JS)  │                   │   (Web App endpoints)   │
└──────────────┘                   └─────────┬──────────────┘
                                              │ SpreadsheetApp
                                              ▼
                                   ┌────────────────────────┐
                                   │ Google Sheets Workbook │
                                   │  (DB + Dashboards)     │
                                   └─────────┬──────────────┘
                                              │ DriveApp
                                              ▼
                                   ┌────────────────────────┐
                                   │ Google Drive (PDFs)    │
                                   └────────────────────────┘
```

* **Google Sheets** = single source of truth (tables & formulas).  
* **Apps Script** = business logic + email/PDF/NFSe automation.  
* **Google Docs** = auto‑generated invoice template → merged to PDF.  
* **NFSe API** = PlugNotas/eNotas (free tier).  
* **Optional** front‑end (React or HTMLService) consumes Apps Script REST.

---

## 2  Data Model (Sheets)

| Sheet | Columns | Notes |
|-------|---------|-------|
| **Machines** | Serial (PK) · Model · ClientID · StorageRate _(R$/month)_ · DateIn · DateOut · Status _(stored / service / returned)_ · LastBilledThrough | Serial is unique key |
| **Services** | ServiceID _(auto)_ · Serial _(validation)_ · ClientID _(lookup)_ · ServiceDate · ServiceType _(dropdown)_ · Description · UnitPrice · QtyHours · TotalPrice _(formula)_ · Billed _(YES/NO)_ | Links to BillingConfig for prices |
| **BillingConfig** | ServiceType _(PK)_ · UnitPrice · DefaultTax% | Maintains price list |
| **Clients** | ClientID _(PK)_ · Name · Address · ContactName · ContactPosition · ContactEmail · ContactPhone · TaxID/CNPJ · Export _(YES/NO)_ | Export=YES triggers NFSe Externa |
| **Invoices** | InvoiceID _(auto)_ · ClientID · PeriodStart · PeriodEnd · IssueDate _(=TODAY())_ · DueDate _(=IssueDate+15)_ · Total · Paid _(YES/NO)_ · PaymentDate · Overdue _(formula)_ · PDFLink · NFSeNumber · NFSeType · LineItemsJSON | Single invoice per client per month |
| **Dashboards** | Auto‑generated tables & charts | No manual edits |

---

## 3  Apps Script Modules

### 3.1  Config (`CONFIG`)
```js
const CONFIG = {
  COMPANY_NAME: 'Devops Consultoria e Desenvolvimento de Softwares LTDA',
  COMPANY_ADDRESS: 'Av. Paulista, 1636, 15º Andar, CJ 04, São Paulo – SP, 01310‑200',
  CNPJ: '54566671000143',
  IM: '13006525',
  PDF_FOLDER_ID: '1roHYH7e5g0CcnLsKa_QWdjnJ0hBmo6Fh',
  COLOR_BLUE: '#003B70'
};

// Fetch sensitive tokens from Script Properties
var SCRIPT_PROPERTIES = PropertiesService.getScriptProperties();

function getNFSeToken() {
  return SCRIPT_PROPERTIES.getProperty('NFSE_TOKEN');
}

function getPixQrUrl() {
  return SCRIPT_PROPERTIES.getProperty('PIX_QR_URL');
}
```

### 3.2  Setup Functions
| Function | Purpose |
|----------|---------|
| `ensureSheets()` | Creates all sheets, headers, formulas, data‑validation. |
| `ensureTemplateDoc()` | Generates Google Docs invoice template (white/blue) on first run and stores Doc ID in Script Properties. |
| `refreshDashboards()` | Inserts `QUERY()` formulas + ChartBuilder graphs (auto‑recalc). |

### 3.3  Operational Triggers
| Function | Trigger Type | Schedule |
|----------|--------------|----------|
| `addService(e)` | **onEdit** (Services) | Event‑based |
| `runMonthlyBilling()` | Time‑driven | 1st day each month, 02:00 |
| `updateOverdueStatus()` | Time‑driven | Daily, 01:00 |
| `refreshDashboards()` | Manual or weekly cron | Mondays, 03:00 |

### 3.4  Core Logic
* **addService** – auto‑populate `UnitPrice` & `TotalPrice`, mark `Billed=NO`.
* **runMonthlyBilling**  
  1. Compute storage (pro‑rata) for all Serial with Status=`stored`.  
  2. Pull un‑billed services.  
  3. Aggregate by Client → create `Invoices` row; build merge object.  
  4. Call `generateInvoicePDF()` → save PDF to Drive, email client.  
  5. Mark services `Billed=YES`, update `LastBilledThrough`.
* **issueNFSe** – manual menu; posts to PlugNotas with correct tags.

---

## 4  Invoice Template Merge Tags

| Tag | Source |
|-----|--------|
| `{{CompanyName}}`, `{{CNPJ}}`, `{{IM}}` | `CONFIG` |
| `{{InvoiceID}}`, `{{IssueDate}}`, `{{DueDate}}`, `{{Total}}` | `Invoices` |
| `{{ClientName}}`, `{{ContactName}}`, `{{ContactEmail}}` | `Clients` |
| `{{LineItemsTable}}` | Generated HTML table inside `generateInvoicePDF()` |

Template created with Apps Script:

```js
doc.appendParagraph(CONFIG.COMPANY_NAME).setBold().setForegroundColor(CONFIG.COLOR_BLUE);
...
```

---

## 5  Dashboard Metrics (live)

| KPI | Query Formula |
|-----|---------------|
| **Revenue per Month** | `=QUERY(Invoices!A:K,"select year(IssueDate), month(IssueDate), sum(Total) where Paid='YES' group by 1,2 label sum(Total) 'Revenue'",1)` |
| **Profit per Month** | Revenue – Costs (`SUMPRODUCT` from Services & Storage) |
| **Avg Storage Days** | `=AVERAGE(IF(Machines!Status="returned", Machines!DateOut - Machines!DateIn))` |
| **Services / Machine** | `=QUERY(Services!A:G,"select Serial, count(ServiceID) group by Serial",1)` |
| **Receivables Aging** | `=ARRAYFORMULA(IF(Invoices!Paid="NO", TODAY()-Invoices!DueDate, ))` |

`refreshDashboards()` writes these into helper ranges, then builds Column / Line / Pie charts with `ChartBuilder`. Since formulas live in the sheet, charts update instantly as data changes—script only runs once at setup.

---

## 6  Zero‑Cost Front‑End (optional)

### Option A – Apps Script `HtmlService`  
* Serve `index.html`, use `google.script.run`.  
* Bootstrap 5, runs within Sheets container (no hosting costs).

### Option B – Static SPA  
* Build React/Vite → deploy to **GitHub Pages** (free).  
* Apps Script Web App provides JSON endpoints `/machines`, `/services`, `/invoices`.

---

## 7  Deployment Checklist

1. Create Google Sheet “Invoice‑Automation”.  
2. Open **Extensions → Apps Script**, paste **Code.gs** (includes all modules).  
3. Run **ensureSheets()** → authorize scope.  
4. Run **Setup / Ensure Sheets** from custom menu (creates template + dashboards).  
5. Add Triggers (monthly, daily).  
6. Add initial Clients, Machines, BillingConfig rows.  
7. Confirm an invoice cycles successfully via **Run Monthly Billing** test.

---

## 8  Future Roadmap

* **Payment QR Code (PIX)** in PDF.  
* **Webhook** from payment gateway to auto‑flag Paid.  
* Multi‑tenant mode: one workbook per client in Shared Drive + master dashboard via Data Studio (free).  
* Mobile PWA front‑end (React + Workbox) hosted on GitHub Pages.

---

## Appendix A – File Structure (repository)

```
/src
  Code.gs               ← Apps Script main file (350 loc)
  README.md             ← this blueprint
/front-end  (optional)
  package.json
  src/App.jsx
/.github/workflows
  deploy_pages.yml      ← CI to GitHub Pages
```

---

_End of Blueprint_  
Save this content as **invoice_automation_blueprint.md** and upload to your AI builder._
