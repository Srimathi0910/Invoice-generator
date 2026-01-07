import { connectDB } from "@/lib/db";
import { sendInvoiceReminders } from "@/lib/sendInvoiceReminders";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  await sendInvoiceReminders();

  return NextResponse.json({ message: "Daily reminders executed" });
}
