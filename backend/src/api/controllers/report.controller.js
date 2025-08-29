const PDFDocument = require('pdfkit');
const pool = require('../../config/db');
const { HttpError } = require('../../middleware/error.middleware');

// POST /api/reports/vulnerabilities/pdf { severity?, status? }
const vulnerabilitiesPdf = async (req, res, next) => {
  try {
    const { severity, status } = req.body || {};
    const filters = [];
    const params = [];
    if (severity) { params.push(severity); filters.push(`severity = $${params.length}`); }
    if (status) { params.push(status); filters.push(`status = $${params.length}`); }
    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const query = `SELECT id, name, severity, status, reported_at FROM vulnerabilities ${where} ORDER BY reported_at DESC LIMIT 1000`;
    const result = await pool.query(query, params);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="vulnerabilities_report.pdf"');
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    doc.pipe(res);
    doc.fontSize(18).text('Vulnerabilities Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated: ${new Date().toISOString()}`);
    if (severity) doc.text(`Filter severity: ${severity}`);
    if (status) doc.text(`Filter status: ${status}`);
    doc.moveDown();
    const rows = result.rows;
    // Table header
    doc.font('Helvetica-Bold');
    doc.text('ID', { continued: true, width: 40 });
    doc.text('Name', { continued: true, width: 180 });
    doc.text('Severity', { continued: true, width: 80 });
    doc.text('Status', { continued: true, width: 80 });
    doc.text('Reported At');
    doc.moveDown(0.5);
    doc.font('Helvetica');
    rows.forEach(r => {
      doc.text(String(r.id), { continued: true, width: 40 });
      doc.text(r.name, { continued: true, width: 180 });
      doc.text(r.severity || '-', { continued: true, width: 80 });
      doc.text(r.status || '-', { continued: true, width: 80 });
      doc.text(new Date(r.reported_at).toISOString());
    });
    if (!rows.length) doc.text('No results for provided filters.');
    doc.end();
  } catch (e) {
    next(e);
  }
};

module.exports = { vulnerabilitiesPdf };