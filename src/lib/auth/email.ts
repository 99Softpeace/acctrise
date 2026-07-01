import { Resend } from "resend";

let resend: Resend | null = null;

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

export async function sendAuthEmail({
  to,
  subject,
  html
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const client = getResend();
  if (!client) {
    console.log(`[Email disabled] ${subject} -> ${to}`);
    return { skipped: true };
  }

  return client.emails.send({
    from: process.env.AUTH_EMAIL_FROM || "Acctrise <no-reply@acctrise.com>",
    to,
    subject,
    html
  });
}

export function appUrl(path: string): string {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  return `${base}${path}`;
}
