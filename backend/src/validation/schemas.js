const { z } = require('zod');

const username = z.string().min(3).max(50);
// Password policy: at least 12 chars incl upper, lower, digit, special
const password = z
  .string()
  .min(12, 'Password must be at least 12 characters long')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/[0-9]/, 'Password must include a digit')
  .regex(/[^A-Za-z0-9]/, 'Password must include a special character');

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
