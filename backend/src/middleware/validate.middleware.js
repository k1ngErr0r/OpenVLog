const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const messages = result.error.issues.map(i => i.message);
    return res.status(400).json({ error: 'Validation failed', details: messages });
  }
  req.body = result.data;
  next();
};

module.exports = { validate };
