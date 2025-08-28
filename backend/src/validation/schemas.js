const { z } = require('zod');

const username = z.string().min(3).max(50);
const password = z.string().min(6).max(128);

const registerSchema = z.object({ username, password });
const loginSchema = z.object({ username, password });

const createUserSchema = z.object({ username, password });

const vulnerabilityBase = {
  name: z.string().min(1).max(255),
  description: z.string().max(5000).optional().or(z.literal('')),
  severity: z.enum(['Critical', 'High', 'Medium', 'Low', 'Informational']).default('Low'),
  status: z.enum(['Open', 'In Progress', 'Resolved', 'Closed']).default('Open'),
};

const createVulnerabilitySchema = z.object(vulnerabilityBase);
const updateVulnerabilitySchema = z.object({ ...vulnerabilityBase });

module.exports = {
  registerSchema,
  loginSchema,
  createUserSchema,
  createVulnerabilitySchema,
  updateVulnerabilitySchema,
};
