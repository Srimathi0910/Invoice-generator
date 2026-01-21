import nodemailer from "nodemailer";
import ReminderLog from "@/models/ReminderLog";

export async function sendPaymentReceivedEmail(invoice: any) {

  // ✅ SAFETY CHECKS
  if (!invoice?.billedTo?.email) {
    console.log(
      `❌ Payment email not sent: missing recipient for invoice ${invoice?.invoiceNumber}`
    );
    return;
  }

if (!invoice.dueDate) {
  console.log(`❌ Email NOT sent. Missing dueDate for invoice ${invoice.invoiceNumber}`);
  return;
}


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
    subject: `✅ Payment Received - ${invoice.invoiceNumber}`,
    html: `
      <h3>Payment Received</h3>
      <p>Invoice <b>${invoice.invoiceNumber}</b> has been paid.</p>
      <p>Amount: ₹${invoice.totals.grandTotal}</p>
    `,
  });

  // ✅ REQUIRED FIELDS — NO VALIDATION ERROR
  await ReminderLog.create({
    invoiceId: invoice._id,
    invoiceNumber: invoice.invoiceNumber,
    dueDate: invoice.dueDate,
    emailSentTo: recipient,
    reminderDate: new Date(),
    type: "PaymentReceived",
  });

  console.log(`📧 Payment received email sent to ${recipient}`);
}
