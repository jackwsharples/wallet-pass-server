import crypto from 'node:crypto';

const ALPHABET = 'ABCDEFGHJKMNPQRSTVWXYZ23456789'; // no O/0/I/1/L

export function makeCode(len = 6): string {
  const bytes = crypto.randomBytes(len);
  let out = '';
  for (let i = 0; i < len; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out.toUpperCase();
}

export function sanitizeCode(input: string): string {
  const up = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return up.replace(/[O0I1L]/g, '');
}

