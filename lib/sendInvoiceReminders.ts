import Invoice from "@/models/Invoice";
import NotificationPreference from "@/models/NotificationPreference";
import ReminderLog from "@/models/ReminderLog";
import nodemailer from "nodemailer";

export async function sendInvoiceReminders() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const invoices = await Invoice.find({});
  console.log("📦 Total invoices found:", invoices.length);

  for (const invoice of invoices) {
    console.log("🔍 Checking invoice:", invoice.invoiceNumber);

    const pref = await NotificationPreference.findOne({
      userId: invoice.userId,
    });

    if (!pref || !pref.dueDateReminder) continue;

    const reminderDate = new Date(invoice.dueDate);
    reminderDate.setDate(reminderDate.getDate() - pref.reminderPeriod);
    reminderDate.setHours(0, 0, 0, 0);

    console.log("📅 Due date:", invoice.dueDate);
    console.log("📅 Reminder date:", reminderDate);
    console.log("📅 Today:", today);

    if (reminderDate.getTime() !== today.getTime()) continue;

    const alreadySent = await ReminderLog.findOne({
      invoiceId: invoice._id,
      reminderDate: today,
    });

    if (alreadySent) continue;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER!,
        pass: process.env.EMAIL_PASS!,
      },
    });

    console.log("📧 Sending email to:", invoice.billedTo.email);

    await transporter.sendMail({
      from: invoice.billedBy.email,
      to: invoice.billedTo.email,
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
        <td>₹${invoice.totals.grandTotal}</td>
      </tr>
    </table>

    <p>Please ensure payment is completed before the due date.</p>

    <p>
      Regards,<br/>
      <strong>${invoice.billedBy.businessName}</strong><br/>
      ${invoice.billedBy.email}
    </p>`,
    });

    await ReminderLog.create({
      invoiceId: invoice._id,
      reminderDate: today,
    });

    console.log("✅ Email sent successfully");
  }
}
