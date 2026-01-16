import Invoice from "../models/invoice.ts";
import NotificationPreference from "../models/NotificationPreference.ts";
import ReminderLog from "../models/ReminderLog.ts";
import { connectDB } from "./db.ts";
import nodemailer from "nodemailer";

/**
 * Send invoice reminders, overdue alerts, or payment received notifications.
 * @param testMode boolean - If true, sends emails regardless of date (for testing)
 */
export async function sendInvoiceReminders(testMode = false) {
  await connectDB();

  const today = new Date();
  today.setHours(0, 0, 0, 0); // start of today

  const invoices = await Invoice.find({});
  console.log(`📦 Total invoices found: ${invoices.length}`);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASS!,
    },
    tls: { rejectUnauthorized: false },
  });

  for (const invoice of invoices) {
    console.log(`\n🔍 Checking invoice: ${invoice.invoiceNumber}`);
    console.log(`Status: ${invoice.status}, Due Date: ${invoice.dueDate.toDateString()}`);

    // Get user notification preferences
    const pref = await NotificationPreference.findOne({ userId: invoice.userId });
    if (!pref) continue;

    const recipient = invoice.billedTo?.email?.trim().toLowerCase();
    if (!recipient || !recipient.includes("@")) {
      console.log(`⚠️ Invalid email for invoice: ${invoice.invoiceNumber}`);
      continue;
    }

    // ------------------------------
    // 1️⃣ Due Date Reminder
    // ------------------------------
    if (pref.dueDateReminder) {
      const reminderDate = new Date(invoice.dueDate);
      reminderDate.setDate(reminderDate.getDate() - pref.reminderPeriod);
      reminderDate.setHours(0, 0, 0, 0);

      const alreadySentReminder = await ReminderLog.findOne({
        invoiceId: invoice._id,
        type: "Reminder",
        reminderDate: { $gte: today, $lte: new Date(today.getTime() + 86399999) },
      });

      if (!alreadySentReminder && (reminderDate.toDateString() === today.toDateString() || testMode)) {
        await sendEmail(transporter, invoice, recipient, "Reminder");
      }
    }

    // ------------------------------
    // 2️⃣ Overdue Alert
    // ------------------------------
    // Auto-mark overdue if unpaid and past due date
    if (invoice.status === "Unpaid" && new Date(invoice.dueDate) < today) {
      invoice.status = "Overdue";
      await invoice.save(); // triggers pre-save hook if implemented
      console.log(`🛑 Invoice ${invoice.invoiceNumber} marked as Overdue`);
    }

    if (invoice.status === "Overdue" && pref.overdueAlert) {
      const alreadySentOverdue = await ReminderLog.findOne({
        invoiceId: invoice._id,
        type: "Overdue",
        reminderDate: { $gte: today, $lte: new Date(today.getTime() + 86399999) },
      });

      if (!alreadySentOverdue || testMode) {
        await sendEmail(transporter, invoice, recipient, "Overdue");
      }
    }

    // ------------------------------
    // 3️⃣ Payment Received Alert
    // ------------------------------
    if (invoice.status === "Paid" && pref.paymentReceived) {
      const alreadySentPayment = await ReminderLog.findOne({
        invoiceId: invoice._id,
        type: "PaymentReceived",
        reminderDate: { $gte: today, $lte: new Date(today.getTime() + 86399999) },
      });

      if (!alreadySentPayment || testMode) {
        await sendEmail(transporter, invoice, recipient, "PaymentReceived");
      }
    }
  }

  console.log("\n⏰ CRON run complete!");
}

// ------------------------------
// Helper to send emails and log them
// ------------------------------
export async function sendEmail(transporter: any, invoice: any, recipient: string, type: string) {
  let subject = "";
  let html = "";

  switch (type) {
    case "Reminder":
      subject = `Invoice Reminder - ${invoice.invoiceNumber}`;
      html = `<h2>Invoice Payment Reminder</h2>
        <p>Dear <strong>${invoice.billedTo?.businessName ?? "Customer"}</strong>,</p>
        <p>This is a reminder for invoice <b>${invoice.invoiceNumber}</b> due on ${new Date(
          invoice.dueDate
        ).toDateString()}</p>
        <p>Amount: ₹${invoice.totals.grandTotal}</p>`;
      break;

    case "Overdue":
      subject = `⚠️ Invoice Overdue - ${invoice.invoiceNumber}`;
      html = `<h2>Invoice Overdue Alert</h2>
        <p>Dear <strong>${invoice.billedTo?.businessName ?? "Customer"}</strong>,</p>
        <p>Invoice <b>${invoice.invoiceNumber}</b> is overdue since ${new Date(
          invoice.dueDate
        ).toDateString()}</p>
        <p>Amount Due: ₹${invoice.totals.grandTotal}</p>`;
      break;

    case "PaymentReceived":
      subject = `✅ Payment Received - ${invoice.invoiceNumber}`;
      html = `<h2>Payment Received</h2>
        <p>Dear <strong>${invoice.billedTo?.businessName ?? "Customer"}</strong>,</p>
        <p>We have received payment for invoice <b>${invoice.invoiceNumber}</b>.</p>
        <p>Amount Paid: ₹${invoice.totals.grandTotal}</p>`;
      break;
  }

  try {
    await transporter.sendMail({
      from: `"${invoice.billedBy?.businessName ?? "Billing"}" <${process.env.EMAIL_USER}>`,
      to: recipient,
      subject,
      html,
    });

    console.log(`📧 [${type}] email sent to ${recipient} for invoice ${invoice.invoiceNumber}`);

    // Log email to ReminderLog
    await ReminderLog.create({
      invoiceId: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      dueDate: invoice.dueDate,
      emailSentTo: recipient,
      reminderDate: new Date(),
      type,
    });
  } catch (err) {
    console.error(`❌ Failed to send ${type} email for invoice: ${invoice.invoiceNumber}`, err);
  }
}
