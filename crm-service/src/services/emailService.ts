import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import type { CustomerRegisteredEvent } from '../types/customerRegisteredEvent.js';

dotenv.config();

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT ?? 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const fromEmail = process.env.FROM_EMAIL;
const andrewId = process.env.ANDREW_ID;

function validateEmailConfig(): void {
  if (!smtpHost) {
    throw new Error('Missing SMTP_HOST');
  }
  if (!smtpUser) {
    throw new Error('Missing SMTP_USER');
  }
  if (!smtpPass) {
    throw new Error('Missing SMTP_PASS');
  }
  if (!fromEmail) {
    throw new Error('Missing FROM_EMAIL');
  }
  if (!andrewId) {
    throw new Error('Missing ANDREW_ID');
  }
}

function buildRecipientEmail(event: CustomerRegisteredEvent): string {
  return event.userId;
}

export async function sendWelcomeEmail(event: CustomerRegisteredEvent): Promise<void> {
  validateEmailConfig();

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: false,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const recipient = buildRecipientEmail(event);

  console.log(`Attempting to send welcome email to ${recipient}`);

  await transporter.sendMail({
    from: fromEmail,
    to: recipient,
    subject: 'Activate your book store account',
    text: [
      `Dear ${event.name},`,
      `Welcome to the Book store created by ${andrewId}.`,
      `Exceptionally this time we won’t ask you to click a link to activate your account.`,
    ].join('\n'),
  });

  console.log(`Welcome email sent to ${recipient}`);
}
