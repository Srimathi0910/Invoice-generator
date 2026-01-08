import { connectDB } from "@/lib/db";
import Invoice from "@/models/invoice";
import { NextRequest, NextResponse } from "next/server";

// PATCH: Update invoice payment info
export async function PATCH(req: NextRequest) {
  await connectDB();

  try {
    const { paymentDate, paymentMethod, paymentStatus } = await req.json();

    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Invoice ID required" },
        { status: 400 }
      );
    }

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Update payment info
    invoice.dueDate = paymentDate ? new Date(paymentDate) : invoice.dueDate;

    invoice.extras = {
      ...invoice.extras,
      paymentMethod: paymentMethod || invoice.extras?.paymentMethod || "UPI",
      paymentStatus: paymentStatus || invoice.extras?.paymentStatus || "Unpaid",
    };

    invoice.status = paymentStatus || invoice.status;

    await invoice.save();

    // Return formatted invoice for frontend
    const formattedInvoice = {
      _id: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      clientName: invoice.billedTo?.businessName || "",
      paymentDate: invoice.dueDate,
      paymentMethod: invoice.extras?.paymentMethod || "UPI",
      paymentStatus: invoice.extras?.paymentStatus || "Unpaid",
      amount: invoice.totals?.grandTotal || 0,
    };

    return NextResponse.json({ success: true, invoice: formattedInvoice }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// GET: Get invoice by ID
export async function GET(req: NextRequest) {
  await connectDB();

  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Invoice ID required" },
        { status: 400 }
      );
    }

    const invoice = await Invoice.findById(id).lean();
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Return the full invoice document
    return NextResponse.json({ success: true, invoice }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

