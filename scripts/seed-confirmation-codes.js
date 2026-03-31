// Seed UNUSED confirmation codes for testing.
// Usage: node scripts/seed-confirmation-codes.js [count] [sessionPrefix]
// Example: node scripts/seed-confirmation-codes.js 5 manual

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const ALPH = 'ABCDEFGHJKMNPQRSTVWXYZ23456789';

function makeCode(len = 6) {
  return Array.from({ length: len }, () => ALPH[Math.floor(Math.random() * ALPH.length)]).join('');
}

async function main() {
  const count = Number(process.argv[2] || 5);
  const sessionPrefix = process.argv[3] || 'manual';
  const now = Date.now();

  const rows = Array.from({ length: count }, (_, i) => ({
    code: makeCode(6),
    status: 'UNUSED',
    stripeSessionId: `${sessionPrefix}:${now}:${i}`
  }));

  await prisma.confirmationCode.createMany({ data: rows, skipDuplicates: true });
  console.log(rows.map((r) => r.code).join('\n'));
}

main()
  .catch((err) => {
    console.error('Seed failed');
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
