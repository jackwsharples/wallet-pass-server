import express from 'express';
import { randomBytes } from 'node:crypto';
import Stripe from 'stripe';
import { getPrisma } from './lib/prisma.js';
import { asyncHandler } from './lib/async-handler.js';
import { verifySessionToken } from './auth-routes.js';
import { ensureCertFilesOnDisk, createPassBuffer } from './pass.js';

type CodeRow = {
  id: number;
  code: string;
  stripeSessionId: string;
  email: string;
  status: 'unused' | 'used';
  createdAt: Date;
  usedAt?: Date;
};

const CODE_RE = /^[A-Za-z0-9]{10,12}$/;
const prisma = getPrisma();

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

function generateCode(length = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) {
    out += chars[bytes[i] % chars.length];
  }
  return out;
}

export function registerDiscountRoutes(app: express.Express) {
  // Lightweight CORS just for these endpoints
  app.use((req, res, next) => {
    // FRONTEND_ORIGIN may be a comma-separated list; Vercel preview URLs are always allowed
    const configured = (process.env.FRONTEND_ORIGIN || '')
      .split(',')
      .map((s) => s.trim().replace(/\/$/, ''))
      .filter(Boolean);
    const origin = req.headers.origin;
    const isVercelPreview =
      typeof origin === 'string' &&
      /^https:\/\/wallet-pass-server-[a-z0-9]+-jackwsharples-projects\.vercel\.app$/.test(origin);
    const allowedOrigin =
      origin && (configured.includes(origin) || isVercelPreview || configured.length === 0)
        ? origin
        : configured[0] || '*';
    res.header('Access-Control-Allow-Origin', allowedOrigin);
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.header('Access-Control-Max-Age', '3600');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    return next();
  });

  app.post('/api/store-code', asyncHandler(async (req, res) => {
    const { stripeSessionId, email } = req.body || {};
    if (!stripeSessionId || typeof stripeSessionId !== 'string' || stripeSessionId.trim().length < 6) {
      return res.status(400).json({ error: 'Missing stripeSessionId' });
    }
    const sid = stripeSessionId.trim();

    // Verify with Stripe that this session exists and was actually paid,
    // and capture buyer email + region metadata for the account page
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) return res.status(500).json({ error: 'Stripe not configured' });
    const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' });
    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.retrieve(sid);
    } catch (err: any) {
      if (typeof err?.type === 'string' && err.type.startsWith('Stripe') && Number(err.statusCode) < 500) {
        return res.status(404).json({ error: 'Unknown checkout session' });
      }
      throw err;
    }
    if (session.payment_status !== 'paid') {
      return res.status(402).json({ error: 'Payment not completed' });
    }

    const sessionEmail = session.customer_details?.email || session.customer_email || null;
    const bodyEmail = typeof email === 'string' && email.trim() ? email.trim() : null;
    const normalizedEmail = (bodyEmail || sessionEmail)?.toLowerCase() || null;
    const metadata =
      session.metadata && Object.keys(session.metadata).length > 0 ? session.metadata : undefined;

    // If a code already exists for this session, return it
    const existing = await prisma.discountCode.findUnique({ where: { stripeSessionId: sid } });
    if (existing) {
      // Backfill email/metadata on codes created before these were captured
      if ((!existing.email && normalizedEmail) || (!existing.metadata && metadata)) {
        await prisma.discountCode.update({
          where: { id: existing.id },
          data: {
            email: existing.email || normalizedEmail,
            metadata: existing.metadata ?? metadata
          }
        });
      }
      return res.json({ success: true, code: existing.code });
    }

    // Generate a unique code and persist
    let newCode = '';
    for (let i = 0; i < 6; i++) {
      const candidate = generateCode(12);
      const collision = await prisma.discountCode.findUnique({ where: { code: candidate } });
      if (!collision) {
        newCode = candidate;
        break;
      }
    }
    if (!newCode) return res.status(500).json({ error: 'Failed to create code' });

    try {
      const row = await prisma.discountCode.create({
        data: {
          code: newCode,
          stripeSessionId: sid,
          email: normalizedEmail,
          status: 'UNUSED',
          metadata
        }
      });
      return res.json({ success: true, code: row.code });
    } catch (err: any) {
      // Unique collision retry once
      if (err?.code === 'P2002') {
        try {
          const row = await prisma.discountCode.findUnique({ where: { stripeSessionId: sid } });
          if (row) return res.json({ success: true, code: row.code });
        } catch (_) {}
      }
      console.error('store-code error', err);
      return res.status(500).json({ error: 'Failed to store code' });
    }
  }));

  app.post('/api/redeem-code', asyncHandler(async (req, res) => {
    const { code, firstName, lastName } = req.body || {};
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Missing code' });
    }
    const normalized = normalizeCode(code);

    const row = await prisma.discountCode.findUnique({ where: { code: normalized } });
    if (!row) return res.status(404).json({ error: 'Invalid code' });
    if (row.status !== 'UNUSED') return res.status(400).json({ error: 'Code already used' });

    // Build the pass BEFORE marking the code used, so a generation failure
    // doesn't burn the customer's code
    const certPaths = await ensureCertFilesOnDisk();
    const orgName = process.env.ORG_NAME || 'Web Pass Org';
    const description = process.env.PASS_DESCRIPTION || 'Web-generated pass';
    const passTypeIdentifier = process.env.PASS_TYPE_IDENTIFIER || '';
    const teamIdentifier = process.env.TEAM_IDENTIFIER || '';
    const normalizeNamePart = (value: unknown) => {
      if (typeof value !== 'string') return '';
      return value.trim().replace(/\s+/g, ' ').slice(0, 40);
    };
    const safeFirst = normalizeNamePart(firstName);
    const safeLast = normalizeNamePart(lastName);
    const providedName = [safeFirst, safeLast].filter(Boolean).join(' ').trim();
    const holderName = providedName || row.email || 'Valued Member';
    const buffer = await createPassBuffer({
      serialNumber: row.code,
      holderName,
      organizationName: orgName,
      description,
      passTypeIdentifier,
      teamIdentifier,
      certPaths
    });

    // Atomic flip: only succeeds if the code is still UNUSED, so two
    // simultaneous redeems can't both get a pass
    const updated = await prisma.discountCode.updateMany({
      where: { code: normalized, status: 'UNUSED' },
      data: { status: 'USED', usedAt: new Date() }
    });
    if (updated.count === 0) {
      return res.status(400).json({ error: 'Code already used' });
    }

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Content-Type', 'application/vnd.apple.pkpass');
    res.setHeader('Content-Disposition', 'attachment; filename="discount_card.pkpass"');
    return res.end(buffer);
  }));

  // Cards belonging to the logged-in user (matched by purchase email)
  app.get(
    '/api/my-cards',
    verifySessionToken,
    asyncHandler(async (req: express.Request & { user?: { id: string; email: string } }, res) => {
      if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

      const cards = await prisma.discountCode.findMany({
        where: { email: req.user.email.toLowerCase() },
        orderBy: { createdAt: 'desc' }
      });

      res.json({
        cards: cards.map((c) => {
          const meta =
            c.metadata && typeof c.metadata === 'object' && !Array.isArray(c.metadata)
              ? (c.metadata as Record<string, any>)
              : {};
          const validUntil = new Date(c.createdAt);
          validUntil.setFullYear(validUntil.getFullYear() + 1);
          return {
            code: c.code,
            status: c.status,
            createdAt: c.createdAt,
            usedAt: c.usedAt,
            validUntil,
            region: meta.regionName || meta.region || null,
            isGift: meta.isGift === 'true'
          };
        })
      });
    })
  );
}
