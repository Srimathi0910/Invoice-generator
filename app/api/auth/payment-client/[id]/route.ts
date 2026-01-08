import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Invoice from "@/models/invoice";
import { connectDB } from "@/lib/db";

/* ---------------- GET PAYMENT INVOICE ---------------- */

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid invoice ID" },
        { status: 400 }
      );
    }

    const invoice = await Invoice.findById(id).lean();

    if (!invoice) {
      return NextResponse.json(
        { message: "Invoice not found" },
        { status: 404 }
      );
    }

    if (invoice.status === "Paid") {
      return NextResponse.json(
        { message: "Invoice already paid" },
        { status: 409 }
      );
    }

    return NextResponse.json(invoice, { status: 200 });

  } catch (error) {
    console.error("PAYMENT CLIENT API ERROR:", error);
    return NextResponse.json(
      { message: "Failed to fetch invoice for payment" },
      { status: 500 }
    );
  }
}

