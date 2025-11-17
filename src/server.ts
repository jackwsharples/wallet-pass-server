import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import compression from 'compression';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { getPrisma } from './lib/prisma.js';
import rateLimit from 'express-rate-limit';
import { makeCode, sanitizeCode } from './lib/code.js';
import { createDownloadToken, verifyDownloadToken } from './lib/token.js';
import { sendConfirmationEmail } from './lib/email.js';
import { registerDiscountRoutes } from './discount-routes.js';
// Lazy-load pass utilities so it works in both ts-node and dist builds
async function getPassLib() {
  const maybeDist = path.join(__dirname, 'pass.js');
  const maybeSrc = path.join(__dirname, '..', 'src', 'pass.js');
  const target = fs.existsSync(maybeDist) ? maybeDist : (fs.existsSync(maybeSrc) ? maybeSrc : maybeDist);
  const mod = await import(pathToFileURL(target).href);
  return mod as { ensureCertFilesOnDisk: Function; createPassBuffer: Function };
}
import { pathToFileURL } from 'node:url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prisma = getPrisma();

const app = express();
app.use(morgan('dev'));
app.use(compression());

// Public assets
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// JSON body for APIs (except Stripe webhook which needs raw)
app.use((req, res, next) => {
  if (req.path === '/webhooks/stripe') return next();
  return express.json()(req, res, next);
});

// Discount card endpoints (in-memory store for Railway demo)
registerDiscountRoutes(app);

// Helpers
function clientIp(req: Request): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '';
}

function userAgent(req: Request): string {
  return req.headers['user-agent'] || '';
}

// Health
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Stripe: create Checkout Session
app.post('/api/create-checkout-session', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { priceId, email, metadata } = req.body || {};
    if (!priceId || typeof priceId !== 'string') {
      return res.status(400).json({ error: 'Missing priceId' });
    }
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) return res.status(500).json({ error: 'Stripe not configured' });
    const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' });
    const appBase = (process.env.APP_BASE_URL || '').replace(/\/$/, '');
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: `${appBase}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appBase}/cancel`,
      customer_email: typeof email === 'string' ? email : undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: typeof metadata === 'object' && metadata ? metadata : undefined
    });
    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
});

// Demo checkout: create a single-use code without Stripe
app.post('/api/demo/checkout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email : undefined;
    const metadata = typeof req.body?.metadata === 'object' && req.body?.metadata ? req.body.metadata : undefined;
    // Try generating a unique code; loop a few times in the rare case of collision
    let code = '';
    for (let i = 0; i < 5; i++) {
      code = makeCode(6);
      try {
        await prisma.confirmationCode.create({
          data: {
            code,
            status: 'UNUSED',
            customerEmail: email || null,
            stripeSessionId: `demo:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
            metadata: metadata ? metadata : undefined
          }
        });
        break; // success
      } catch (e: any) {
        if (e?.code !== 'P2002') throw e; // not a unique violation
      }
    }
    if (!code) return res.status(500).json({ error: 'Failed to create demo code' });
    res.json({ code });
  } catch (err) {
    next(err);
  }
});

// Stripe webhook: raw body
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!secret || !stripeKey) return res.status(500).json({ error: 'Stripe not configured' });
  const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' });
  const sig = req.headers['stripe-signature'] as string | undefined;
  if (!sig) return res.status(400).json({ error: 'Missing signature' });
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body as any, sig, secret);
  } catch (e: any) {
    return res.status(400).send(`Webhook Error: ${e.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
      const customerEmail = session.customer_details?.email || session.customer_email || undefined;
      const stripeSessionId = session.id;
      const metadata = session.metadata || undefined;

      if (paymentIntentId) {
        // Idempotent insert: unique on stripePaymentId
        const code = makeCode(6);
        try {
          await prisma.confirmationCode.create({
            data: {
              code,
              status: 'UNUSED',
              customerEmail: customerEmail || null,
              stripePaymentId: paymentIntentId,
              stripeSessionId,
              metadata: metadata ? metadata : undefined
            }
          });
        } catch (e: any) {
          // P2002 unique constraint violation => do nothing (idempotent)
          if (e?.code !== 'P2002') throw e;
        }

        if (customerEmail) {
          // Send latest code for this PI (either newly created or existing)
          const row = await prisma.confirmationCode.findFirst({
            where: { stripePaymentId: paymentIntentId },
          });
          if (row) {
            await sendConfirmationEmail({ to: customerEmail, code: row.code });
          }
        }
      }
    }

    if (event.type === 'charge.refunded' || event.type === 'charge.refund.updated') {
      const charge = event.data.object as Stripe.Charge | Stripe.Refund;
      const paymentIntentId = (charge as any).payment_intent as string | undefined;
      if (paymentIntentId) {
        await prisma.confirmationCode.updateMany({
          where: { stripePaymentId: paymentIntentId, status: 'UNUSED' },
          data: { status: 'VOID' }
        });
      }
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error('Webhook handler error', err);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Success page (SSR minimal HTML)
app.get('/success', (req, res) => {
  const hasSession = Boolean(req.query.session_id);
  const html = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Payment Complete</title><style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#0b1020;color:#e5e7eb;margin:0;display:grid;place-items:center;height:100vh}.card{background:#0f172a;border:1px solid #1f2a44;border-radius:16px;padding:24px;max-width:560px}.btn{display:inline-block;margin-top:16px;background:#007aff;color:#fff;padding:12px 16px;border-radius:10px;text-decoration:none;font-weight:700}</style></head><body><div class="card"><h1>Payment complete</h1><p>${hasSession ? 'Your code has been emailed.' : 'Thanks for your purchase.'}</p><a class="btn" href="/redeem">Go to redeem</a></div></body></html>`;
  res.type('html').send(html);
});

// Redeem page (static file if exists, else inline minimal HTML)
app.get('/redeem', (req, res) => {
  const file = path.join(publicDir, 'redeem.html');
  if (fs.existsSync(file)) return res.sendFile(file);
  const html = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Redeem</title><style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#0b1020;color:#e5e7eb;margin:0;display:grid;place-items:center;min-height:100vh}.card{background:#0f172a;border:1px solid #1f2a44;border-radius:16px;padding:24px;max-width:560px;width:92vw}.row{margin:12px 0}.input{width:100%;padding:12px 14px;border-radius:10px;border:1px solid #334155;background:#111827;color:#e5e7eb}.btn{margin-top:8px;background:#007aff;color:#fff;border:0;padding:12px 16px;border-radius:10px;font-weight:700;cursor:pointer}</style></head><body><div class="card"><h1>Redeem Code</h1><div class="row"><input id="code" class="input" placeholder="Enter your code"/></div><div class="row"><input id="email" class="input" placeholder="Email (optional)"/></div><button class="btn" id="submit">Redeem</button><div id="msg" style="margin-top:10px;opacity:.8"></div></div><script>document.getElementById('submit').addEventListener('click',async()=>{const code=document.getElementById('code').value.trim();const email=document.getElementById('email').value.trim();const r=await fetch('/api/redeem',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code,email:email||undefined})});const data=await r.json();if(!r.ok){document.getElementById('msg').textContent=data.error||'Redeem failed';return;}window.location.href = '/api/pass/download?token='+encodeURIComponent(data.token);});</script></body></html>`;
  res.type('html').send(html);
});

// Rate limit for redeem
const redeemLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.REDEEM_RATE_LIMIT_PER_MINUTE || 20),
  standardHeaders: true,
  legacyHeaders: false
});

// Redeem API
app.post('/api/redeem', redeemLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, email, name } = req.body || {};
    if (!code || typeof code !== 'string') return res.status(400).json({ error: 'Missing code' });
    const cleaned = sanitizeCode(code);
    const row = await prisma.confirmationCode.findUnique({ where: { code: cleaned } });
    if (!row) return res.status(404).json({ error: 'Invalid code' });
    if (row.status !== 'UNUSED') return res.status(400).json({ error: 'Code already used or void' });
    if (row.expiresAt && new Date(row.expiresAt).getTime() < Date.now()) return res.status(400).json({ error: 'Code expired' });
    if (email && row.customerEmail && email.toLowerCase() !== row.customerEmail.toLowerCase()) {
      return res.status(400).json({ error: 'Email does not match' });
    }
    const ip = clientIp(req);
    const ua = userAgent(req);
    await prisma.$transaction([
      prisma.confirmationCode.update({
        where: { id: row.id },
        data: { status: 'USED', usedAt: new Date(), redeemAuditIp: ip, redeemAuditUa: ua }
      })
    ]);
    const safeName = typeof name === 'string' ? name.trim().slice(0, 64) : undefined;
    const token = createDownloadToken(60, safeName);
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

// Download pass using short-lived token
app.get('/api/pass/download', async (req, res) => {
  try {
    const token = (req.query.token as string) || '';
    verifyDownloadToken(token);

    const assetsDir = path.join(process.cwd(), 'assets');
    const passPath = path.join(assetsDir, 'current.pkpass');
    res.setHeader('Content-Type', 'application/vnd.apple.pkpass');
    res.setHeader('Content-Disposition', 'attachment; filename="discount_card.pkpass"');

    if (fs.existsSync(passPath)) {
      const stream = fs.createReadStream(passPath);
      stream.pipe(res);
      stream.on('error', (e) => {
        console.error('Stream error', e);
        res.destroy(e as any);
      });
      return;
    }

    // Fallback: generate on the fly using existing pass generator
    const { ensureCertFilesOnDisk, createPassBuffer } = await getPassLib();
    const certPaths = await ensureCertFilesOnDisk();
    const serial = Date.now().toString(36);
    const orgName = process.env.ORG_NAME || 'Web Pass Org';
    const description = process.env.PASS_DESCRIPTION || 'Web-generated pass';
    const passTypeIdentifier = process.env.PASS_TYPE_IDENTIFIER || '';
    const teamIdentifier = process.env.TEAM_IDENTIFIER || '';
    const holderFromToken = (verifyDownloadToken(token) as any).name as string | undefined;
    const buffer = await createPassBuffer({
      serialNumber: serial,
      holderName: holderFromToken || 'Buyer',
      organizationName: orgName,
      description,
      passTypeIdentifier,
      teamIdentifier,
      certPaths
    });
    res.end(buffer);
  } catch (err: any) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }
});

// Existing pass generator route kept for compatibility
app.get('/api/pass', async (req, res) => {
  try {
    const { ensureCertFilesOnDisk, createPassBuffer } = await getPassLib();
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
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create pass', message: String(err?.message || err) });
  }
});

// Fallback: SPA index
app.get('*', (req, res) => {
  const indexPath = path.join(publicDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send('App is running. Build missing public/index.html');
  }
});

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`Server on http://localhost:${port}`);
});
