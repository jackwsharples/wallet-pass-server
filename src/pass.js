import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { PKPass } from 'passkit-generator';

const RUNTIME_CERT_DIR = path.join(process.cwd(), '.run', 'certs');

function envB64(name) {
  const v = process.env[name];
  if (!v) return undefined;
  // Trim common accidental prefixes like data:...;base64,
  const parts = v.split('base64,');
  return Buffer.from(parts.pop(), 'base64');
}

export async function ensureCertFilesOnDisk() {
  // Prefer explicit file paths if provided
  const certPathEnv = process.env.PASS_CERT_PATH;
  const keyPathEnv = process.env.PASS_KEY_PATH;
  const wwdrPathEnv = process.env.WWDR_CERT_PATH;

  if (certPathEnv && keyPathEnv && wwdrPathEnv &&
      fs.existsSync(certPathEnv) && fs.existsSync(keyPathEnv) && fs.existsSync(wwdrPathEnv)) {
    return { signerCert: certPathEnv, signerKey: keyPathEnv, wwdr: wwdrPathEnv };
  }

  // Otherwise, write base64 envs to runtime files for Railway
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

function getImageBuffer(name) {
  // 1x1 png transparent as fallback; iOS accepts it though it won’t look pretty
  const base = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Yf8a3sAAAAASUVORK5CYII=';
  return Buffer.from(base, 'base64');
}

export async function createPassBuffer({
  serialNumber,
  holderName,
  organizationName,
  description,
  passTypeIdentifier,
  teamIdentifier,
  certPaths,
  barcode
}) {
  const keyPassphrase = process.env.PASS_KEY_PASSPHRASE || undefined;

  // Minimal generic pass config
  const fields = {
    description,
    organizationName,
    passTypeIdentifier,
    teamIdentifier,
    serialNumber,
    // These colors can be overridden by pass-model.pass/pass.json
    backgroundColor: 'rgb(34,139,94)',
    foregroundColor: 'rgb(255,255,255)',
    labelColor: 'rgb(255,210,77)',
    generic: {
      primaryFields: [],
      secondaryFields: [],
      auxiliaryFields: [
        { key: 'name', label: 'Name', value: holderName },
        { key: 'id', label: 'ID', value: serialNumber }
      ],
      backFields: [
        { key: 'about', label: 'How to use', value: 'Show this pass at checkout. Add to Apple Wallet for faster access. Contact support if you need help replacing a pass.' }
      ]
    }
  };

  if (barcode && barcode.message) {
    fields.barcodes = [
      {
        format: barcode.format || 'PKBarcodeFormatQR',
        message: barcode.message,
        messageEncoding: 'iso-8859-1'
      }
    ];
  }

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
    fields
  );

  if (typeof pass.getAsBuffer === 'function') {
    return await pass.getAsBuffer();
  }
  if (typeof pass.asBuffer === 'function') {
    return await pass.asBuffer();
  }
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
  if (fs.existsSync(staticDir)) {
    await ensureModelAssets(staticDir);
    return staticDir;
  }
  return await buildInMemoryModel();
}

async function ensureModelAssets(dir) {
  const ensure = async (name) => {
    const p = path.join(dir, name);
    if (!fs.existsSync(p)) await fsp.writeFile(p, getImageBuffer(name));
  };
  await ensure('icon.png');
  await ensure('icon@2x.png');

  const icon1x = path.join(dir, 'icon.png');
  const icon2x = path.join(dir, 'icon@2x.png');
  const logo1x = path.join(dir, 'logo.png');
  const logo2x = path.join(dir, 'logo@2x.png');

  // If a logo is not supplied, copy icon so your branding still appears at the top
  if (!fs.existsSync(logo1x) && fs.existsSync(icon1x)) {
    await fsp.copyFile(icon1x, logo1x);
  } else if (!fs.existsSync(logo1x)) {
    await ensure('logo.png');
  }
  if (!fs.existsSync(logo2x)) {
    if (fs.existsSync(icon2x)) {
      await fsp.copyFile(icon2x, logo2x);
    } else {
      await ensure('logo@2x.png');
    }
  }
}

async function buildInMemoryModel() {
  // Create a temporary model folder with minimal required assets
  // passkit-generator expects a folder ending with .pass
  const dir = path.join(process.cwd(), '.run', 'model.pass');
  await fsp.rm(dir, { recursive: true, force: true });
  await fsp.mkdir(dir, { recursive: true });

  const passJson = {
    formatVersion: 1,
    passTypeIdentifier: 'REPLACED_AT_RUNTIME',
    serialNumber: 'REPLACED_AT_RUNTIME',
    teamIdentifier: 'REPLACED_AT_RUNTIME',
    organizationName: 'REPLACED_AT_RUNTIME',
    description: 'REPLACED_AT_RUNTIME',
    generic: { primaryFields: [], secondaryFields: [] }
  };
  await fsp.writeFile(path.join(dir, 'pass.json'), JSON.stringify(passJson, null, 2));

  // Minimal required images: icon.png (+@2x) and logo.png (+@2x)
  const oneX = getImageBuffer('icon');
  const twoX = getImageBuffer('icon@2x');
  await fsp.writeFile(path.join(dir, 'icon.png'), oneX);
  await fsp.writeFile(path.join(dir, 'icon@2x.png'), twoX);
  await fsp.writeFile(path.join(dir, 'logo.png'), oneX);
  await fsp.writeFile(path.join(dir, 'logo@2x.png'), twoX);

  return dir;
}
