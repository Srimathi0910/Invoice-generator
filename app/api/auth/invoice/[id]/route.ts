import { connectDB } from "@/lib/db";
import Invoice from "@/models/invoice";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

/* =====================================================
   PATCH → Update Invoice Payment Details
   ===================================================== */
export async function PATCH(req: NextRequest) {
  await connectDB();

  try {
    // ---------- AUTH ----------
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/accessToken=([^;]+)/);
    if (!tokenMatch) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

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
    if (!invoice) {
      return NextResponse.json({ success: false, error: "Invoice not found or unauthorized" }, { status: 404 });
    }

    // ---------- Update Payment Details ----------
    if (paymentDate) invoice.dueDate = new Date(paymentDate);
    if (!invoice.extras) invoice.extras = {};
    invoice.extras.paymentMethod = paymentMethod || invoice.extras.paymentMethod || "NA";
    if (paymentStatus) invoice.status = paymentStatus;

    await invoice.save();

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

/* =====================================================
   GET → Fetch All Invoices for Logged-in User
   ===================================================== */
export async function GET(req: NextRequest) {
  await connectDB();

  try {
    // ---------- AUTH ----------
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/accessToken=([^;]+)/);
    if (!tokenMatch) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const token = tokenMatch[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }

    const userEmail = decoded.email;
    if (!userEmail) return NextResponse.json({ success: false, error: "Email not in token" }, { status: 401 });

    // ---------- Fetch All Invoices Where Logged-in User is billedBy ----------
    const invoices = await Invoice.find({ "billedBy.email": userEmail })
      .sort({ invoiceDate: -1 })
      .lean();

    const payments = invoices.map((inv) => ({
      _id: inv._id.toString(),
      invoiceNumber: inv.invoiceNumber,
      clientName: inv.billedTo?.businessName || "N/A",
      paymentDate: inv.dueDate ? new Date(inv.dueDate).toISOString() : "",
      paymentMethod: inv.extras?.paymentMethod || "NA",
      paymentStatus: inv.extras?.paymentStatus || inv.status || "Unpaid",
      amount: inv.totals?.grandTotal || 0,
    }));

    return NextResponse.json({ success: true, payments }, { status: 200 });
  } catch (err: any) {
    console.error("GET invoices error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
