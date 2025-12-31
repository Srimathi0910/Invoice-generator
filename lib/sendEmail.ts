// /lib/sendEmail.ts
import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // Gmail App Password (16-char, no spaces)
  },
});

export default async function sendEmail({ to, subject, text, html }: EmailOptions) {
  try {
    await transporter.sendMail({
      from: `"Invoice App" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log(`Email sent successfully to: ${to}`);
  } catch (err) {
    console.error("Failed to send email:", err);
    throw err;
  }
}
