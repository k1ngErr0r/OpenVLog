#!/usr/bin/env node
const crypto = require('crypto');
function gen() { return crypto.randomBytes(32).toString('hex'); }
console.log('JWT_SECRET=' + gen());
console.log('JWT_REFRESH_SECRET=' + gen());
console.log('\nTo rotate:');
console.log('1. Copy the above into your .env');
console.log('2. Run: docker-compose up -d --build backend');
