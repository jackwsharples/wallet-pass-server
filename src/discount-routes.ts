import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { randomBytes } from 'node:crypto';
import { getPrisma } from './lib/prisma.js';

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

function resolvePassPath() {
  const primary = path.join(process.cwd(), 'assets', 'discount_card.pkpass');
  const fallback = path.join(process.cwd(), 'assets', 'current.pkpass');
  if (fs.existsSync(primary)) return primary;
  if (fs.existsSync(fallback)) return fallback;
  return primary; // default path even if missing; handler will error later
}

export function registerDiscountRoutes(app: express.Express) {
  // Lightweight CORS just for these endpoints
  app.use((req, res, next) => {
    const allowedOrigin = process.env.FRONTEND_ORIGIN || '*';
    res.header('Access-Control-Allow-Origin', allowedOrigin);
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.header('Access-Control-Max-Age', '3600');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    return next();
  });

  app.post('/api/store-code', async (req, res) => {
    const { stripeSessionId, email } = req.body || {};
    if (!stripeSessionId || typeof stripeSessionId !== 'string' || stripeSessionId.trim().length < 6) {
      return res.status(400).json({ error: 'Missing stripeSessionId' });
    }

    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : null;
    const sid = stripeSessionId.trim();

    // If a code already exists for this session, return it
    const existing = await prisma.discountCode.findUnique({ where: { stripeSessionId: sid } });
    if (existing) {
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
          status: 'UNUSED'
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
  });

  app.post('/api/redeem-code', async (req, res) => {
    const { code } = req.body || {};
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Missing code' });
    }
    const normalized = normalizeCode(code);

    const row = await prisma.discountCode.findUnique({ where: { code: normalized } });
    if (!row) return res.status(404).json({ error: 'Invalid code' });
    if (row.status !== 'UNUSED') return res.status(400).json({ error: 'Code already used' });

    await prisma.discountCode.update({
      where: { code: normalized },
      data: { status: 'USED', usedAt: new Date() }
    });

    const sendPath = resolvePassPath();
    if (!fs.existsSync(sendPath)) {
      return res.status(500).json({ error: 'Pass file missing on server' });
    }

    res.setHeader('Content-Type', 'application/vnd.apple.pkpass');
    res.setHeader('Content-Disposition', 'attachment; filename=\"discount_card.pkpass\"');
    return res.sendFile(sendPath, (err) => {
      if (err) console.error('pkpass send error', err);
    });
  });
}
