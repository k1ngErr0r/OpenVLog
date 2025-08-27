const winston = require('winston');
const vulnerabilityService = require('../../services/vulnerability.service');

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
    try {
        const vulnerabilities = await vulnerabilityService.getAllVulnerabilities();
        logger.info('Fetched all vulnerabilities.');
        res.json(vulnerabilities);
    } catch (error) {
        logger.error(`Error fetching vulnerabilities: ${error.message}`, { stack: error.stack });
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getVulnerabilityById = async (req, res) => {
    const { id } = req.params;
    try {
        const vulnerability = await vulnerabilityService.getVulnerabilityById(id);
        if (!vulnerability) {
            logger.warn(`Vulnerability ${id} not found.`);
            return res.status(404).json({ error: 'Vulnerability not found' });
        }
        logger.info(`Fetched vulnerability: ${id}`);
        res.json(vulnerability);
    } catch (error) {
        logger.error(`Error fetching vulnerability ${id}: ${error.message}`, { stack: error.stack });
        res.status(500).json({ error: 'Internal server error' });
    }
};

const addVulnerability = async (req, res) => {
    const { name, description, severity, status } = req.body;
    if (!name) {
        logger.warn('Attempt to add vulnerability with missing name.');
        return res.status(400).json({ error: 'Vulnerability name is required' });
    }
    try {
        const vulnerability = await vulnerabilityService.addVulnerability(name, description, severity, status);
        logger.info(`Vulnerability added: ${name}`);
        res.status(201).json(vulnerability);
    } catch (error) {
        logger.error(`Error adding vulnerability ${name}: ${error.message}`, { stack: error.stack });
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateVulnerability = async (req, res) => {
    const { id } = req.params;
    const { name, description, severity, status } = req.body;
    if (!name) {
        logger.warn(`Attempt to update vulnerability ${id} with missing name.`);
        return res.status(400).json({ error: 'Vulnerability name is required' });
    }
    try {
        const vulnerability = await vulnerabilityService.updateVulnerability(id, name, description, severity, status);
        if (!vulnerability) {
            logger.warn(`Vulnerability ${id} not found for update.`);
            return res.status(404).json({ error: 'Vulnerability not found' });
        }
        logger.info(`Vulnerability updated: ${id}`);
        res.json(vulnerability);
    } catch (error) {
        logger.error(`Error updating vulnerability ${id}: ${error.message}`, { stack: error.stack });
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteVulnerability = async (req, res) => {
    const { id } = req.params;
    try {
        const vulnerability = await vulnerabilityService.deleteVulnerability(id);
        if (!vulnerability) {
            logger.warn(`Vulnerability ${id} not found for deletion.`);
            return res.status(404).json({ error: 'Vulnerability not found' });
        }
        logger.info(`Vulnerability deleted: ${id}`);
        res.status(204).send(); // No Content
    } catch (error) {
        logger.error(`Error deleting vulnerability ${id}: ${error.message}`, { stack: error.stack });
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllVulnerabilities,
    getVulnerabilityById,
    addVulnerability,
    updateVulnerability,
    deleteVulnerability,
};
