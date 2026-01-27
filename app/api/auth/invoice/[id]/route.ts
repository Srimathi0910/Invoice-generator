import { connectDB } from "@/lib/db";
import Invoice from "@/models/invoice";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { sendPaymentReceivedEmail } from "@/utils/sendPaymentEmail";
import { sendOverdueEmail } from "@/utils/sendOverdueEmail.ts"; // <-- create a simple overdue email helper

export async function PATCH(req: NextRequest) {
  await connectDB();

  try {
    // ---------- AUTH ----------
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/accessToken=([^;]+)/);
    if (!tokenMatch) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const token = tokenMatch[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }

    const userEmail = decoded.email;
    if (!userEmail) return NextResponse.json({ success: false, error: "Email not in token" }, { status: 401 });

    // ---------- Get Invoice ID and Payment Data ----------
    const { paymentDate, paymentMethod, paymentStatus } = await req.json();
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();
    if (!id) return NextResponse.json({ success: false, error: "Invoice ID required" }, { status: 400 });

    // ---------- Fetch Invoice Only If Logged-in User is billedBy ----------
    const invoice = await Invoice.findOne({ _id: id, "billedBy.email": userEmail });
    if (!invoice) return NextResponse.json({ success: false, error: "Invoice not found or unauthorized" }, { status: 404 });

    const oldStatus = invoice.status;

    // ---------- Update Payment Details ----------
    if (paymentDate) invoice.dueDate = new Date(paymentDate);
    if (!invoice.extras) invoice.extras = {};
    invoice.extras.paymentMethod = paymentMethod || invoice.extras.paymentMethod || "NA";
    if (paymentStatus) invoice.status = paymentStatus;

    await invoice.save();

    // ---------- SEND EMAILS BASED ON STATUS CHANGE ----------
    try {
      if ((oldStatus === "Unpaid" || oldStatus === "Overdue") && invoice.status === "Paid") {
        // ✅ Payment received
        await sendPaymentReceivedEmail(invoice);
      } else if (oldStatus === "Unpaid" && invoice.status === "Overdue") {
        // ⚠️ Overdue alert
        await sendOverdueEmail(invoice);
      }
    } catch (err) {
      console.error("Error sending status-change email:", err);
    }

    return NextResponse.json(
      {
        success: true,
        invoice: {
          _id: invoice._id,
          invoiceNumber: invoice.invoiceNumber,
          clientName: invoice.billedTo?.businessName || "",
          paymentDate: invoice.dueDate,
          paymentMethod: invoice.extras.paymentMethod || "NA",
          status: invoice.status,
          amount: invoice.totals?.grandTotal || 0,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("PATCH invoice error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
import { NextApiRequest, NextApiResponse } from "next";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const { id } = req.query;

  try {
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    res.status(200).json({ success: true, invoice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
