import { NextRequest, NextResponse } from "next/server";
import Invoice from "@/models/invoice";
import NotificationPreference from "@/models/NotificationPreference";
import { connectDB } from "@/lib/db";
import { sendPaymentReceivedEmail } from "@/utils/sendPaymentEmail";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { invoiceId, newStatus } = body;

    // ✅ Validate request
    if (!invoiceId || !newStatus) {
      return NextResponse.json(
        { error: "invoiceId and newStatus are required" },
        { status: 400 }
      );
    }

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    const oldStatus = invoice.status;

    // ✅ Update status
    invoice.status = newStatus;
    await invoice.save();

    // ✅ Only trigger email on valid transition
    const validTransition =
      (oldStatus === "Unpaid" || oldStatus === "Overdue") &&
      newStatus === "Paid";

    if (validTransition) {
      const pref = await NotificationPreference.findOne({
        userId: invoice.userId,
      });

      if (pref?.paymentReceived) {
        await sendPaymentReceivedEmail(invoice);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("❌ Update invoice status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
