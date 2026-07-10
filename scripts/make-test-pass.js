// Quick local smoke test that generates a signed .pkpass file to assets/test-output.pkpass
// Requires the same cert env vars/paths as the server (PASS_CERT_PATH/KEY_PATH/WWDR_CERT_PATH
// or PASS_CERT_BASE64/PASS_KEY_BASE64/WWDR_CERT_BASE64). Optional PASS_KEY_PASSPHRASE.
// Run: node --env-file=.env scripts/make-test-pass.js

import fs from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { ensureCertFilesOnDisk, createPassBuffer } from '../src/pass.js';

async function main() {
  const outPath = path.join(process.cwd(), 'assets', 'test-output.pkpass');

  console.log('Ensuring certs are available...');
  const certPaths = await ensureCertFilesOnDisk();

  const serial = `TEST${Date.now().toString(36).toUpperCase()}`;
  const holderName = 'Local Test User';
  const organizationName = process.env.ORG_NAME || 'Local Discount Card';
  const description = process.env.PASS_DESCRIPTION || 'Local Discount Card';
  const passTypeIdentifier = process.env.PASS_TYPE_IDENTIFIER || '';
  const teamIdentifier = process.env.TEAM_IDENTIFIER || '';

  // Same shape the real redeem flow produces
  const verifyToken = randomBytes(16).toString('hex');
  const verifyBase = (process.env.APP_BASE_URL || 'https://wallet-pass-server.vercel.app').replace(/\/$/, '');
  const validUntil = new Date();
  validUntil.setFullYear(validUntil.getFullYear() + 1);

  console.log('Building pass buffer...');
  const buffer = await createPassBuffer({
    serialNumber: serial,
    holderName,
    organizationName,
    description,
    passTypeIdentifier,
    teamIdentifier,
    certPaths,
    barcode: { message: `${verifyBase}/verify/${verifyToken}` },
    validUntil,
    region: 'Boone'
  });

  await fs.mkdir(path.join(process.cwd(), 'assets'), { recursive: true });
  await fs.writeFile(outPath, buffer);
  console.log(`Pass written to ${outPath}`);
  console.log(`QR encodes: ${verifyBase}/verify/${verifyToken}`);
  console.log('(Test token is not in the database, so the verify page will show Not Valid — expected.)');
}

main().catch((err) => {
  console.error('Failed to generate test pass');
  console.error(err);
  process.exit(1);
});
