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
  const vulnerabilities = await vulnerabilityService.getAllVulnerabilities();
  res.json(vulnerabilities);
};

const getVulnerabilityById = async (req, res) => {
  const { id } = req.params;
  const vulnerability = await vulnerabilityService.getVulnerabilityById(id);
  if (!vulnerability) throw new HttpError(404, 'Vulnerability not found', 'NOT_FOUND');
  res.json(vulnerability);
};

const addVulnerability = async (req, res) => {
  const { name, description, severity, status } = req.body;
  if (!name) throw new HttpError(400, 'Vulnerability name is required', 'VALIDATION');
  const vulnerability = await vulnerabilityService.addVulnerability(name, description, severity, status);
  res.status(201).json(vulnerability);
};

const updateVulnerability = async (req, res) => {
  const { id } = req.params;
  const { name, description, severity, status } = req.body;
  if (!name) throw new HttpError(400, 'Vulnerability name is required', 'VALIDATION');
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

module.exports = {
    getAllVulnerabilities,
    getVulnerabilityById,
    addVulnerability,
    updateVulnerability,
    deleteVulnerability,
};
