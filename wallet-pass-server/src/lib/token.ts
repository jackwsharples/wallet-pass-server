import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';

export interface DownloadTokenPayload {
  typ: 'pass-download';
  exp: number;
  jti: string;
  name?: string;
}

export function createDownloadToken(ttlSeconds = 60, name?: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not set');
  const payload: DownloadTokenPayload = {
    typ: 'pass-download',
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    jti: crypto.randomBytes(16).toString('hex'),
    name: name ? String(name).slice(0, 64) : undefined
  };
  return jwt.sign(payload, secret);
}

export function verifyDownloadToken(token: string): DownloadTokenPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not set');
  const decoded = jwt.verify(token, secret) as DownloadTokenPayload;
  if (decoded.typ !== 'pass-download') throw new Error('Invalid token type');
  return decoded;
}
