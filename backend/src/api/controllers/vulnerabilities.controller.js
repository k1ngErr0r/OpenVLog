const { Parser } = require('json2csv');
const winston = require('winston');
const vulnerabilityService = require('../../services/vulnerability.service');
const { HttpError } = require('../../middleware/error.middleware');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console(),
    ],
  });

const getAllVulnerabilities = async (req, res) => {
  const { page, pageSize, severity, status, search, sort, dateFrom, dateTo } = req.query;
  const hasParams = page || pageSize || severity || status || search || sort || dateFrom || dateTo;

  // If no pagination/filter params supplied, preserve legacy behavior (return full list array)
  if (!hasParams) {
    const vulnerabilities = await vulnerabilityService.getAllVulnerabilities();
    return res.json(vulnerabilities);
  }

  // Validation for enums (reuse existing constants)
  if (severity && !VALID_SEVERITIES.includes(severity)) throw new HttpError(400, 'Invalid severity', 'VALIDATION');
  if (status && !VALID_STATUS.includes(status)) throw new HttpError(400, 'Invalid status', 'VALIDATION');

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const sizeNum = Math.min(Math.max(parseInt(pageSize, 10) || 20, 1), 100);

  // Sort parsing: expected format field:direction
  let sortField = 'reported_at';
  let sortDir = 'DESC';
  if (sort) {
    const [f, d] = String(sort).split(':');
    const allowedFields = ['reported_at', 'severity', 'status', 'name'];
    if (allowedFields.includes(f)) sortField = f;
    if (d && ['asc','desc','ASC','DESC'].includes(d)) sortDir = d.toUpperCase();
  }

  const result = await vulnerabilityService.getVulnerabilities({
    page: pageNum,
    pageSize: sizeNum,
    severity,
    status,
    search,
    sortField,
    sortDir,
    dateFrom,
    dateTo,
  });

  res.json(result);
};

const getVulnerabilityById = async (req, res) => {
  const { id } = req.params;
  const vulnerability = await vulnerabilityService.getVulnerabilityById(id);
  if (!vulnerability) throw new HttpError(404, 'Vulnerability not found', 'NOT_FOUND');
  res.json(vulnerability);
};

const { VALID_SEVERITIES, VALID_STATUS } = require('../../constants/vulnerabilities');

const addVulnerability = async (req, res) => {
  const { name, description, severity, status } = req.body;
  if (!name) throw new HttpError(400, 'Vulnerability name is required', 'VALIDATION');
  if (severity && !VALID_SEVERITIES.includes(severity)) throw new HttpError(400, 'Invalid severity', 'VALIDATION');
  if (status && !VALID_STATUS.includes(status)) throw new HttpError(400, 'Invalid status', 'VALIDATION');
  const vulnerability = await vulnerabilityService.addVulnerability(name, description, severity, status);
  res.status(201).json(vulnerability);
};

const updateVulnerability = async (req, res) => {
  const { id } = req.params;
  const { name, description, severity, status } = req.body;
  if (!name) throw new HttpError(400, 'Vulnerability name is required', 'VALIDATION');
  if (severity && !VALID_SEVERITIES.includes(severity)) throw new HttpError(400, 'Invalid severity', 'VALIDATION');
  if (status && !VALID_STATUS.includes(status)) throw new HttpError(400, 'Invalid status', 'VALIDATION');
  const vulnerability = await vulnerabilityService.updateVulnerability(id, name, description, severity, status);
  if (!vulnerability) throw new HttpError(404, 'Vulnerability not found', 'NOT_FOUND');
  res.json(vulnerability);
};

const deleteVulnerability = async (req, res) => {
  const { id } = req.params;
  const vulnerability = await vulnerabilityService.deleteVulnerability(id);
  if (!vulnerability) throw new HttpError(404, 'Vulnerability not found', 'NOT_FOUND');
  res.status(204).send();
};

const getVulnerabilityStats = async (req, res) => {
    const stats = await vulnerabilityService.getVulnerabilityStats();
    res.json(stats);
};

const exportVulnerabilities = async (req, res) => {
    const { severity, status, search, sort, dateFrom, dateTo } = req.query;

    // Validation for enums (reuse existing constants)
    if (severity && !VALID_SEVERITIES.includes(severity)) throw new HttpError(400, 'Invalid severity', 'VALIDATION');
    if (status && !VALID_STATUS.includes(status)) throw new HttpError(400, 'Invalid status', 'VALIDATION');

    // Sort parsing: expected format field:direction
    let sortField = 'reported_at';
    let sortDir = 'DESC';
    if (sort) {
        const [f, d] = String(sort).split(':');
        const allowedFields = ['reported_at', 'severity', 'status', 'name'];
        if (allowedFields.includes(f)) sortField = f;
        if (d && ['asc','desc','ASC','DESC'].includes(d)) sortDir = d.toUpperCase();
    }

    const vulnerabilities = await vulnerabilityService.getAllVulnerabilitiesForExport({
        severity,
        status,
        search,
        sortField,
        sortDir,
        dateFrom,
        dateTo,
    });

    const fields = ['id', 'name', 'description', 'severity', 'status', 'reported_at', 'updated_at'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(vulnerabilities);

    res.header('Content-Type', 'text/csv');
    res.attachment('vulnerabilities.csv');
    res.send(csv);
};

// (Duplicate exportVulnerabilities definition removed below)

module.exports = {
    getAllVulnerabilities,
    getVulnerabilityById,
    addVulnerability,
    updateVulnerability,
    deleteVulnerability,
    getVulnerabilityStats,
    exportVulnerabilities,
};
