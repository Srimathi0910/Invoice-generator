// /lib/sendEmail.ts
import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

// Create a reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587, // Default to 587 if not set
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // Gmail App Password (16-char) or SMTP password
  },
  tls: {
    rejectUnauthorized: false, // Ignore self-signed certificates
  },
});

export default async function sendEmail({ to, subject, text, html }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"Invoice App" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: text || undefined,
      html: html || undefined,
    });
    console.log(`✅ Email sent successfully to: ${to}, MessageId: ${info.messageId}`);
  } catch (err: any) {
    console.error("❌ Failed to send email:", err.message || err);
    throw new Error(`Email sending failed: ${err.message || err}`);
  }
}
