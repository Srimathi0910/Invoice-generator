import Invoice from "../models/invoice.ts";
import NotificationPreference from "../models/NotificationPreference.ts";
import ReminderLog from "../models/ReminderLog.ts";
import { connectDB } from "./db.ts";
import nodemailer from "nodemailer";

export async function sendInvoiceReminders(testMode = false) {
  await connectDB();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const invoices = await Invoice.find({});
  console.log(`📦 Total invoices found: ${invoices.length}`);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASS!,
    },
  });

  for (const invoice of invoices) {

    // ✅ SAFETY 1: skip invoices without dueDate
    if (!invoice.dueDate) {
      console.log(
        `⚠️ Skipping invoice ${invoice.invoiceNumber} (missing dueDate)`
      );
      continue;
    }

    const pref = await NotificationPreference.findOne({
      userId: invoice.userId,
    });
    if (!pref) continue;

    const recipient = invoice.billedTo?.email?.trim().toLowerCase();
    if (!recipient) continue;

    // =============================
    // 1️⃣ DUE DATE REMINDER
    // =============================
    if (pref.dueDateReminder) {
      const reminderDate = new Date(invoice.dueDate);
      reminderDate.setDate(reminderDate.getDate() - pref.reminderPeriod);
      reminderDate.setHours(0, 0, 0, 0);

      const alreadySent = await ReminderLog.findOne({
        invoiceId: invoice._id,
        type: "Reminder",
        dueDate: invoice.dueDate,
      });

      if (
        !alreadySent &&
        (reminderDate.getTime() === today.getTime() || testMode)
      ) {
        await sendEmail(transporter, invoice, recipient, "Reminder");
      }
    }

    // =============================
    // 2️⃣ OVERDUE ALERT
    // =============================
    if (invoice.status === "Unpaid" && new Date(invoice.dueDate) < today) {
      invoice.status = "Overdue";
      await invoice.save();
    }

    if (invoice.status === "Overdue" && pref.overdueAlert) {
      const alreadySent = await ReminderLog.findOne({
        invoiceId: invoice._id,
        type: "Overdue",
        dueDate: invoice.dueDate,
      });

      if (!alreadySent || testMode) {
        await sendEmail(transporter, invoice, recipient, "Overdue");
      }
    }
  }

  console.log("⏰ CRON completed");
}

// ---------------- EMAIL HELPER ----------------
export async function sendEmail(
  transporter: any,
  invoice: any,
  recipient: string,
  type: "Reminder" | "Overdue" | "PaymentReceived"
) {
  // ✅ SAFETY 2: final guard
  if (!invoice.dueDate) {
    console.log(
      `❌ Email NOT sent. Missing dueDate for invoice ${invoice.invoiceNumber}`
    );
    return;
  }

  let subject = "";
  let html = "";

  if (type === "Reminder") {
    subject = `Invoice Reminder - ${invoice.invoiceNumber}`;
    html = `
      <p>Invoice <b>${invoice.invoiceNumber}</b> is due on
      ${new Date(invoice.dueDate).toDateString()}</p>
      <p>Amount: ₹${invoice.totals.grandTotal}</p>
    `;
  }

  if (type === "Overdue") {
    subject = `⚠️ Invoice Overdue - ${invoice.invoiceNumber}`;
    html = `
      <p>Invoice <b>${invoice.invoiceNumber}</b> is overdue.</p>
      <p>Amount Due: ₹${invoice.totals.grandTotal}</p>
    `;
  }

  if (type === "PaymentReceived") {
    subject = `✅ Payment Received - ${invoice.invoiceNumber}`;
    html = `
      <p>Payment received for invoice <b>${invoice.invoiceNumber}</b>.</p>
      <p>Amount Paid: ₹${invoice.totals.grandTotal}</p>
    `;
  }

  await transporter.sendMail({
    from: `"${invoice.billedBy.businessName}" <${process.env.EMAIL_USER}>`,
    to: recipient,
    subject,
    html,
  });

  // ✅ SAFE ReminderLog save
  await ReminderLog.create({
    invoiceId: invoice._id,
    invoiceNumber: invoice.invoiceNumber,
    dueDate: invoice.dueDate,
    emailSentTo: recipient,
    reminderDate: new Date(),
    type,
  });

  console.log(`📧 ${type} email sent to ${recipient}`);
}
