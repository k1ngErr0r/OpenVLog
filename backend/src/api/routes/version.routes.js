const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Lazy read & cache package.json to avoid repeated disk IO
let cached;
function getMeta() {
  if (cached) return cached;
  try {
    const pkgPath = path.join(__dirname, '../../../package.json');
    const raw = fs.readFileSync(pkgPath, 'utf8');
    const pkg = JSON.parse(raw);
    // Minimal public surface; hide scripts, etc.
    cached = {
      name: pkg.name,
      version: pkg.version,
      dependencies: pkg.dependencies,
      node: process.version,
      env: process.env.NODE_ENV || 'development',
      commit: process.env.GIT_COMMIT || null,
    };
  } catch (e) {
    cached = { error: e.message };
  }
  return cached;
}

router.get('/', (_req, res) => {
  res.json(getMeta());
});

module.exports = router;
