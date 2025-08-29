# Advanced Reporting Plan

## Goals
Extend reporting beyond CSV to include PDF exports, filters, and scheduled reports.

## Phases
1. PDF on-demand export.
2. Saved report definitions (filters + columns).
3. Scheduled delivery via email.

## PDF Export
- Endpoint: `POST /api/reports/vulnerabilities/pdf` with JSON filter payload.
- Queue job if large (> N rows) else inline generation.
- Library: `pdfkit` or headless Chromium (Puppeteer) for rich layout. Choose `pdfkit` first (lighter).

### Data Pipeline
1. Validate filter (date range, severity, status).
2. Query DB, stream rows.
3. Render table with pagination in PDF.
4. Add summary metrics (counts by severity, SLA breaches).

### Response
- Inline download (`application/pdf`) with filename `vulnerabilities_YYYYMMDD_HHmm.pdf`.

## Saved Reports
Table: `report_definitions`
- id (uuid)
- user_id
- name
- config (JSON)
- schedule_cron (nullable)
- last_run_at

## Scheduling
- Use lightweight scheduler (node-cron) or external (Bull + Redis) to enqueue.
- Each scheduled run generates PDF, stores in S3-compatible storage, emails link.

## Email Delivery
- Use existing mail service or add `nodemailer` + SMTP creds.
- Security: Signed URL expiring in 24h for download.

## Authorization
- Users only access own report definitions unless admin.

## Client UX
- Reporting page: list saved reports, create/edit, run now, download history.
- PDF generation indicator (spinner or toast with progress).

## Metrics
- Track generation time, rows per report, scheduled failures.

## Future Enhancements
- Custom templates (company logo, cover page).
- XLSX export via `exceljs`.
- API key-based external access.
