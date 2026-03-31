// Quick local smoke test that generates a signed .pkpass file to assets/test-output.pkpass
// Requires the same cert env vars/paths as the server (PASS_CERT_PATH/KEY_PATH/WWDR_CERT_PATH
// or PASS_CERT_BASE64/PASS_KEY_BASE64/WWDR_CERT_BASE64). Optional PASS_KEY_PASSPHRASE.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ensureCertFilesOnDisk, createPassBuffer } from '../src/pass.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const outPath = path.join(process.cwd(), 'assets', 'test-output.pkpass');

  console.log('Ensuring certs are available...');
  const certPaths = await ensureCertFilesOnDisk();

  const serial = Date.now().toString(36);
  const holderName = 'Local Test User';
  const organizationName = process.env.ORG_NAME || 'Web Pass Org';
  const description = process.env.PASS_DESCRIPTION || 'Local test pass';
  const passTypeIdentifier = process.env.PASS_TYPE_IDENTIFIER || '';
  const teamIdentifier = process.env.TEAM_IDENTIFIER || '';

  console.log('Building pass buffer...');
  const buffer = await createPassBuffer({
    serialNumber: serial,
    holderName,
    organizationName,
    description,
    passTypeIdentifier,
    teamIdentifier,
    certPaths,
    barcode: { message: `TEST-${serial}`, format: 'PKBarcodeFormatQR' }
  });

  await fs.mkdir(path.join(process.cwd(), 'assets'), { recursive: true });
  await fs.writeFile(outPath, buffer);
  console.log(`Pass written to ${outPath}`);
}

main().catch((err) => {
  console.error('Failed to generate test pass');
  console.error(err);
  process.exit(1);
});
