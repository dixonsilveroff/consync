#!/usr/bin/env node

/**
 * Generate secure random secrets for JWT tokens
 * Run this script to generate secrets for your .env file
 */

import crypto from 'crypto';

console.log('\n🔐 Generating secure secrets for ConSync Backend...\n');
console.log('Copy these values to your Render environment variables:\n');
console.log('─────────────────────────────────────────────────────\n');

const jwtSecret = crypto.randomBytes(64).toString('hex');
const jwtRefreshSecret = crypto.randomBytes(64).toString('hex');

console.log('JWT_SECRET=');
console.log(jwtSecret);
console.log('\n');

console.log('JWT_REFRESH_SECRET=');
console.log(jwtRefreshSecret);
console.log('\n');
console.log('─────────────────────────────────────────────────────\n');
console.log('✅ Secrets generated successfully!\n');
console.log('⚠️  Keep these secrets secure and never commit them to Git.\n');
