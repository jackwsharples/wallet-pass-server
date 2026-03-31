export async function createPassBuffer({
  serialNumber,
  holderName,
  organizationName,
  description,
  passTypeIdentifier,
  teamIdentifier,
  certPaths,
  barcode = undefined,
  userRegion = undefined
}) {
  const keyPassphrase = process.env.PASS_KEY_PASSPHRASE || undefined;
  
  // Safe Fallbacks
  const safeName = typeof holderName === 'string' && holderName.trim() ? holderName.trim() : 'Valued Member';
  const safeRegion = typeof userRegion === 'string' && userRegion.trim() ? userRegion.trim() : 'Boone, NC';
  const qrUrl = (barcode && barcode.message) || process.env.PASS_QR_URL;
  const safeMessage = qrUrl || 'https://localdiscountcard.net/?page_id=22';

  // CACHE BUSTING: Append a timestamp to the serial so Apple Wallet ALWAYS sees a new pass
  const baseSerial = serialNumber || 'TEST-000000';
  const safeSerial = `${baseSerial}-${Date.now()}`;

  const modelDir = await resolveModelDir();
  
  // 1. Only pass top-level strings into the constructor
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
      description,
      organizationName,
      passTypeIdentifier,
      teamIdentifier,
      serialNumber: safeSerial,
      backgroundColor: 'rgb(79, 138, 102)',
      foregroundColor: 'rgb(255, 255, 255)',
      labelColor: 'rgb(240, 230, 140)',
      logoText: 'BOONE'
    }
  );

  // 2. Bypass the deep-merge bug by assigning fields directly to the pass instance
  pass.type = 'storeCard';

  pass.primaryFields = [
    { key: 'title', label: 'DEAL', value: 'DISCOUNT CARD' }
  ];

  pass.secondaryFields = [
    { key: 'cardholder', label: 'CARDHOLDER', value: safeName },
    { key: 'expires', label: 'EXPIRES', value: '12/31/2026' },
    { key: 'region', label: 'REGION', value: safeRegion }
  ];

  pass.barcodes = [
    {
      format: 'PKBarcodeFormatQR',
      message: safeMessage,
      messageEncoding: 'iso-8859-1',
      altText: 'Scan to verify'
    }
  ];

  // 3. Output Buffer
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