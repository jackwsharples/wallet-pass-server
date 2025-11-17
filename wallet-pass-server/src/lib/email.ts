import type { ConfirmationCode } from '@prisma/client';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';

export interface SendCodeParams {
  to: string;
  code: string;
}

function codeEmailText(code: string): string {
  const baseUrl = process.env.APP_BASE_URL || '';
  const redeemUrl = `${baseUrl.replace(/\/$/, '')}/redeem`;
  return [
    'Thanks for your purchase!',
    '',
    `Your confirmation code: ${code}`,
    '',
    `Redeem here: ${redeemUrl}`,
    '',
    'This code is single-use. Keep it safe.'
  ].join('\n');
}

export async function sendConfirmationEmail({ to, code }: SendCodeParams): Promise<void> {
  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM || 'no-reply@example.com';
  const subject = 'Your confirmation code';
  const text = codeEmailText(code);

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const resend = new Resend(resendKey);
    await resend.emails.send({ from, to, subject, text });
    return;
  }

  const host = process.env.SMTP_HOST || 'smtp.example.com';
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER || 'user';
  const pass = process.env.SMTP_PASS || 'pass';
  const secure = port === 465;
  const transport = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
  await transport.sendMail({ from, to, subject, text });
}

