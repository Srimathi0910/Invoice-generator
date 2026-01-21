import { connectDB } from "@/lib/db";
import Invoice from "@/models/invoice";
import NotificationPreference from "@/models/NotificationPreference";
import ReminderLog from "@/models/ReminderLog";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET() {
  await connectDB();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const invoices = await Invoice.find({});

  console.log("📦 Total invoices found:", invoices.length);

  for (const invoice of invoices) {
    console.log("🔍 Checking invoice:", invoice.invoiceNumber);

    const pref = await NotificationPreference.findOne({
      userId: invoice.userId,
    });

    if (!pref) {
      console.log("❌ No preference found for user:", invoice.userId);
      continue;
    }

    if (!pref.dueDateReminder) {
      console.log("⏭ Reminder disabled for user:", invoice.userId);
      continue;
    }

    const reminderDate = new Date(invoice.dueDate);
    reminderDate.setDate(reminderDate.getDate() - pref.reminderPeriod);
    reminderDate.setHours(0, 0, 0, 0);

    console.log("📅 Due date:", invoice.dueDate.toDateString());
    console.log("📅 Reminder date:", reminderDate.toDateString());
    console.log("📅 Today:", today.toDateString());

    // ✅ SAFE DATE CHECK
    if (reminderDate.toDateString() !== today.toDateString()) {
      console.log("⏭ Not reminder day yet");
      continue;
    }

    const alreadySent = await ReminderLog.findOne({
      invoiceId: invoice._id,
      reminderDate: today,
    });

    if (alreadySent) {
      console.log("⚠️ Reminder already sent");
      continue;
    }

    console.log("📧 Sending email to:", invoice.billedTo.email);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER, // IMPORTANT
      to: invoice.billedTo.email,
      subject: `Invoice Reminder - ${invoice.invoiceNumber}`,
      html: `
        <h3>Invoice Payment Reminder</h3>
        <p><b>Invoice No:</b> ${invoice.invoiceNumber}</p>
        <p><b>Amount Due:</b> ₹${invoice.totals.grandTotal}</p>
        <p><b>Due Date:</b> ${invoice.dueDate.toDateString()}</p>
      `,
    });

    await ReminderLog.create({
      invoiceId: invoice._id,
      reminderDate: today,
    });

    console.log("✅ Email sent successfully");
  }

  return NextResponse.json({ message: "Reminder test executed" });
}
