import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { PKPass } from 'passkit-generator';

const RUNTIME_CERT_DIR = path.join(process.cwd(), '.run', 'certs');

// Brand palette (must match frontend-v2/src/index.css)
const BRAND_BG = 'rgb(27, 67, 50)'; // --color-brand-green-dark #1b4332
const BRAND_FG = 'rgb(255, 255, 255)';
const BRAND_LABEL = 'rgb(201, 168, 76)'; // --color-brand-gold #c9a84c

function envB64(name) {
  const v = process.env[name];
  if (!v) return undefined;
  const parts = v.split('base64,');
  return Buffer.from(parts.pop(), 'base64');
}

export async function ensureCertFilesOnDisk() {
  const certPathEnv = process.env.PASS_CERT_PATH;
  const keyPathEnv = process.env.PASS_KEY_PATH;
  const wwdrPathEnv = process.env.WWDR_CERT_PATH;

  if (certPathEnv && keyPathEnv && wwdrPathEnv &&
      fs.existsSync(certPathEnv) && fs.existsSync(keyPathEnv) && fs.existsSync(wwdrPathEnv)) {
    return { signerCert: certPathEnv, signerKey: keyPathEnv, wwdr: wwdrPathEnv };
  }

  await fsp.mkdir(RUNTIME_CERT_DIR, { recursive: true });
  const certB64 = envB64('PASS_CERT_BASE64');
  const keyB64 = envB64('PASS_KEY_BASE64');
  const wwdrB64 = envB64('WWDR_CERT_BASE64');

  if (!certB64 || !keyB64 || !wwdrB64) {
    throw new Error('Certificate material missing. Set PASS_CERT_PATH/KEY_PATH/WWDR_CERT_PATH or PASS_CERT_BASE64/PASS_KEY_BASE64/WWDR_CERT_BASE64.');
  }

  const signerCert = path.join(RUNTIME_CERT_DIR, 'pass-cert.pem');
  const signerKey = path.join(RUNTIME_CERT_DIR, 'pass-key.pem');
  const wwdr = path.join(RUNTIME_CERT_DIR, 'wwdr.pem');

  await fsp.writeFile(signerCert, certB64);
  await fsp.writeFile(signerKey, keyB64);
  await fsp.writeFile(wwdr, wwdrB64);

  return { signerCert, signerKey, wwdr };
}

function formatValidThru(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * @param {{
 *   serialNumber?: string,
 *   holderName?: string,
 *   organizationName?: string,
 *   description?: string,
 *   passTypeIdentifier?: string,
 *   teamIdentifier?: string,
 *   certPaths: { signerCert: string, signerKey: string, wwdr: string },
 *   barcode?: { message: string, format?: string },
 *   validUntil?: Date,
 *   region?: string
 * }} options
 * @returns {Promise<Buffer>}
 */
export async function createPassBuffer({
  serialNumber,
  holderName,
  organizationName,
  description,
  passTypeIdentifier,
  teamIdentifier,
  certPaths,
  barcode = undefined,
  validUntil = undefined,
  region = undefined
}) {
  const keyPassphrase = process.env.PASS_KEY_PASSPHRASE || undefined;

  const safeName = typeof holderName === 'string' && holderName.trim() ? holderName.trim() : 'Valued Member';
  const qrUrl = (barcode && barcode.message) || process.env.PASS_QR_URL || 'https://www.localdiscountcard.net';

  // Serial gets a timestamp suffix so re-downloads register as a fresh pass
  const baseSerial = serialNumber || 'TEST-000000';
  const safeSerial = `${baseSerial}-${Date.now()}`;

  const modelDir = await resolveModelDir();

  const pass = await PKPass.from(
    {
      model: modelDir,
      certificates: {
        wwdr: fs.readFileSync(certPaths.wwdr),
        signerCert: fs.readFileSync(certPaths.signerCert),
        signerKey: fs.readFileSync(certPaths.signerKey),
        signerKeyPassphrase: keyPassphrase
      }
    },
    {
      description: description || 'Local Discount Card',
      organizationName: organizationName || 'Local Discount Card',
      passTypeIdentifier,
      teamIdentifier,
      serialNumber: safeSerial,
      logoText: 'Local Discount Card',
      backgroundColor: BRAND_BG,
      foregroundColor: BRAND_FG,
      labelColor: BRAND_LABEL
    }
  );

  pass.type = 'storeCard';

  // Region sits top-right like an airline gate number; header fields are also
  // what shows when the pass is stacked in Wallet
  if (region) {
    pass.headerFields.push({ key: 'region', label: 'REGION', value: String(region).toUpperCase() });
  }

  // Front: two fields only — clean, minimal
  pass.secondaryFields.push({ key: 'member', label: 'MEMBER', value: safeName });
  if (validUntil) {
    pass.secondaryFields.push({ key: 'validThru', label: 'VALID THRU', value: formatValidThru(validUntil) });
  }

  // Details live on the back of the pass
  pass.backFields.push({ key: 'memberId', label: 'Member ID', value: baseSerial });
  if (region) {
    pass.backFields.push({ key: 'regionBack', label: 'Region', value: region });
  }
  pass.backFields.push({
    key: 'about',
    label: 'About',
    value: 'Show this card at participating local businesses to receive your member discount.'
  });
  pass.backFields.push({ key: 'website', label: 'Website', value: 'https://www.localdiscountcard.net' });

  // Wallet dims/expires the pass natively after the membership year
  if (validUntil) {
    pass.setExpirationDate(new Date(validUntil));
  }

  pass.setBarcodes({
    format: 'PKBarcodeFormatQR',
    message: qrUrl,
    messageEncoding: 'iso-8859-1',
    altText: baseSerial
  });

  if (typeof pass.getAsBuffer === 'function') return await pass.getAsBuffer();
  if (typeof pass.asBuffer === 'function') return await pass.asBuffer();
  if (typeof pass.getAsStream === 'function') {
    const stream = await pass.getAsStream();
    const chunks = [];
    await new Promise((resolve, reject) => {
      stream.on('data', (c) => chunks.push(c));
      stream.on('end', resolve);
      stream.on('error', reject);
    });
    return Buffer.concat(chunks);
  }
  throw new Error('Unsupported pass output method');
}

async function resolveModelDir() {
  const staticDir = path.join(process.cwd(), 'pass-model.pass');
  if (fs.existsSync(staticDir)) return staticDir;
  throw new Error('pass-model.pass directory not found. Run: node scripts/generate-pass-assets.mjs');
}
