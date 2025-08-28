// Simple migration runner (sequential *.sql in migrations directory)
const fs = require('fs');
const path = require('path');
const pool = require('./src/config/db');

(async () => {
  const dir = path.join(__dirname, 'migrations');
  const files = (await fs.promises.readdir(dir))
    .filter(f => /\.sql$/.test(f))
    .sort();

  await pool.query('CREATE TABLE IF NOT EXISTS _migrations (id SERIAL PRIMARY KEY, filename TEXT UNIQUE NOT NULL, applied_at TIMESTAMPTZ DEFAULT now())');
  const appliedRes = await pool.query('SELECT filename FROM _migrations');
  const applied = new Set(appliedRes.rows.map(r => r.filename));

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = await fs.promises.readFile(path.join(dir, file), 'utf8');
    process.stdout.write(`Applying ${file}... `);
    await pool.query('BEGIN');
    try {
      await pool.query(sql);
      await pool.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
      await pool.query('COMMIT');
      console.log('done');
    } catch (e) {
      await pool.query('ROLLBACK');
      console.error(`failed: ${e.message}`);
      process.exit(1);
    }
  }
  await pool.end();
})();
