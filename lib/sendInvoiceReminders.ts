import Invoice from "../models/invoice.ts";
import NotificationPreference from "../models/NotificationPreference.ts";
import ReminderLog from "../models/ReminderLog.ts";
import { connectDB } from "./db.ts";
import nodemailer from "nodemailer";

export async function sendInvoiceReminders() {
  // Connect to MongoDB
  await connectDB();

  const today = new Date();
  today.setHours(0, 0, 0, 0); // normalize to start of day

  const invoices = await Invoice.find({});
  console.log("📦 Total invoices found:", invoices.length);

  // Create transporter with TLS fix
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASS!, // use App Password if 2FA is enabled
    },
    tls: {
      rejectUnauthorized: false, // fixes self-signed certificate error
    },
  });

  for (const invoice of invoices) {
    console.log("🔍 Checking invoice:", invoice.invoiceNumber);

    const pref = await NotificationPreference.findOne({ userId: invoice.userId });
    if (!pref || !pref.dueDateReminder) continue;

    // Calculate reminder date
    const reminderDate = new Date(invoice.dueDate);
    reminderDate.setDate(reminderDate.getDate() - pref.reminderPeriod);
    reminderDate.setHours(0, 0, 0, 0);

    const isSameDay = reminderDate.toISOString().slice(0, 10) === today.toISOString().slice(0, 10);
    if (!isSameDay) continue;

    // Avoid sending twice in one day
    const startOfDay = new Date(today);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const alreadySent = await ReminderLog.findOne({
      invoiceId: invoice._id,
      reminderDate: { $gte: startOfDay, $lte: endOfDay },
    });
    if (alreadySent) continue;

    // Trim email to avoid hidden spaces
    const recipient = invoice.billedTo.email?.trim().toLowerCase();

    if (!recipient || !recipient.includes("@")) {
      console.log("⚠️ Skipping invoice, invalid email:", invoice.invoiceNumber, invoice.billedTo.email);
      continue;
    }


    console.log("📧 Sending email to:", recipient);

    try {
      await transporter.sendMail({
        from: `"${invoice.billedBy.businessName}" <${process.env.EMAIL_USER}>`,
        to: recipient,
        subject: `Invoice Reminder - ${invoice.invoiceNumber}`,
        html: `
          <h2>Invoice Payment Reminder</h2>
          <p>Dear <strong>${invoice.billedTo.businessName}</strong>,</p>
          <p>This is a reminder for the following invoice:</p>
          <table border="1" cellpadding="8" cellspacing="0">
            <tr>
              <td><strong>Invoice Number</strong></td>
              <td>${invoice.invoiceNumber}</td>
            </tr>
            <tr>
              <td><strong>Due Date</strong></td>
              <td>${new Date(invoice.dueDate).toDateString()}</td>
            </tr>
            <tr>
              <td><strong>Total Amount</strong></td>
              <td>₹${Number(invoice.totals.grandTotal).toFixed(2)}</td>
            </tr>

          </table>
          <p>Please ensure payment is completed before the due date.</p>
          <p>
            Regards,<br/>
            <strong>${invoice.billedBy.businessName}</strong><br/>
            ${invoice.billedBy.email}
          </p>
        `,
      });

      // Log reminder sent
      await ReminderLog.create({
        invoiceId: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        dueDate: invoice.dueDate,
        emailSentTo: invoice.billedTo.email,
        reminderDate: today,
      });

      console.log("✅ Email sent successfully for invoice:", invoice.invoiceNumber);
    } catch (error) {
      console.error("❌ Failed to send email for invoice:", invoice.invoiceNumber, error);
    }
  }

  console.log("⏰ CRON run complete!");
}
