// src/lib/email.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email, name) {
  return await resend.emails.send({
    from: 'noreply@yourdomain.com',
    to: email,
    subject: 'Welcome to SSR Blog!',
    html: `<h1>Welcome ${name}!</h1><p>Thanks for joining our blog.</p>`
  });
}