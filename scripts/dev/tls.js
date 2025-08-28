#!/usr/bin/env node
/**
 * Local TLS helper (documentation stub).
 * Intentionally does not auto-run mkcert (cross-platform variance).
 * Prints instructions for enabling HTTPS dev with Traefik + mkcert.
 */

const fs = require('fs');
const path = require('path');

const CERT_DIR = path.join(process.cwd(), 'certs');

function main() {
  console.log('--- OpenVLog Local TLS Guide ---');
  console.log('\n1. Install mkcert (https://github.com/FiloSottile/mkcert)');
  console.log('   macOS:   brew install mkcert nss');
  console.log('   Windows: choco install mkcert (then run mkcert -install)');
  console.log('   Linux:   refer to mkcert README + install libnss3-tools if needed');
  console.log('\n2. Generate certificates:');
  console.log('   mkcert -install');
  console.log('   mkcert -key-file certs/local-key.pem -cert-file certs/local-cert.pem "localhost" 127.0.0.1 ::1');
  console.log('\n3. Ensure certs/ is gitignored (will add suggestion if missing).');
  console.log('4. Update docker-compose override to mount ./certs -> /certs for Traefik.');
  console.log('5. Add Traefik TLS configuration referencing /certs/local-cert.pem and /certs/local-key.pem.');
  console.log('6. Set FRONTEND_ORIGIN=https://localhost and VITE_API_BASE_URL=https://localhost:443 (or mapped port).');
  console.log('\nDirectory check:');
  if (!fs.existsSync(CERT_DIR)) {
    fs.mkdirSync(CERT_DIR, { recursive: true });
    console.log('  Created certs/ directory.');
  } else {
    console.log('  certs/ already exists.');
  }
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gi = fs.readFileSync(gitignorePath, 'utf8');
    if (!/^[#\s]*certs\/?$/m.test(gi)) {
      console.log('\nSuggestion: add "certs/" to .gitignore');
    }
  }
  console.log('\nThis script is informational only.');
}

main();
