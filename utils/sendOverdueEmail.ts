import nodemailer from "nodemailer";
import ReminderLog from "@/models/ReminderLog";

export async function sendOverdueEmail(invoice: any) {
  if (!invoice?.billedTo?.email || !invoice?.dueDate) return;

  const recipient = invoice.billedTo.email.trim().toLowerCase();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASS!,
    },
  });

  await transporter.sendMail({
    from: `"${invoice.billedBy.businessName}" <${process.env.EMAIL_USER}>`,
    to: recipient,
    subject: `⚠️ Invoice Overdue - ${invoice.invoiceNumber}`,
    html: `
      <h3>Invoice Overdue</h3>
      <p>Invoice <b>${invoice.invoiceNumber}</b> is now overdue.</p>
      <p>Amount Due: ₹${invoice.totals.grandTotal}</p>
    `,
  });

  await ReminderLog.create({
    invoiceId: invoice._id,
    invoiceNumber: invoice.invoiceNumber,
    dueDate: invoice.dueDate,
    emailSentTo: recipient,
    reminderDate: new Date(),
    type: "Overdue",
  });

  console.log(`📧 Overdue email sent to ${recipient}`);
}
