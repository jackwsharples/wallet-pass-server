import express from 'express';
import morgan from 'morgan';
import compression from 'compression';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { createPassBuffer, ensureCertFilesOnDisk } from './pass.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(morgan('dev'));
app.use(compression());
app.use(express.json());

const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// Health
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Generate a pass with query parameters or defaults
  app.get('/api/pass', async (req, res) => {
    try {
      // Make sure certs exist on disk (Railway env → runtime files)
      const certPaths = await ensureCertFilesOnDisk();

      const holderName = (req.query.name || 'Guest').toString();
      const serial = (req.query.serial || Date.now().toString(36)).toString();
      const orgName = process.env.ORG_NAME || 'Web Pass Org';
      const description = process.env.PASS_DESCRIPTION || 'Web-generated pass';
      const passTypeIdentifier = process.env.PASS_TYPE_IDENTIFIER || '';
      const teamIdentifier = process.env.TEAM_IDENTIFIER || '';
      const barcodeMessage = req.query.code ? req.query.code.toString() : undefined;
      const barcodeFormat = req.query.barcodeFormat ? req.query.barcodeFormat.toString() : undefined;

      const buffer = await createPassBuffer({
        serialNumber: serial,
        holderName,
        organizationName: orgName,
        description,
        passTypeIdentifier,
        teamIdentifier,
        certPaths,
        barcode: barcodeMessage ? { message: barcodeMessage, format: barcodeFormat } : undefined
      });

    res.setHeader('Content-Type', 'application/vnd.apple.pkpass');
    res.setHeader('Content-Disposition', `attachment; filename=pass-${serial}.pkpass`);
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create pass', message: String(err?.message || err) });
  }
});

// Serve the single page app
app.get('*', (req, res) => {
  const indexPath = path.join(publicDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send('App is running. Build missing public/index.html');
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`Server on http://localhost:${port}`);
});
