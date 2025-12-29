import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Invoice from "@/models/invoice";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json([], { status: 200 });
    }

    const invoices = await Invoice.find({ userEmail: email }).sort({
      createdAt: -1,
    });

    // ✅ Map DB structure → Dashboard structure
    const mappedInvoices = invoices.map((inv) => ({
      _id: inv._id,

      // shown in Invoice column
      invoiceNumber: inv.invoiceNumber,

      // shown in Client column
      clientName: inv.billedTo?.businessName || "N/A",

      // shown in Amount column
      amount: inv.totals?.grandTotal || 0,

      // shown in Status column (derived, since no status in schema)
      status:
        new Date(inv.dueDate) < new Date()
          ? "Overdue"
          : "Unpaid",

      // shown in Date column
      date: inv.invoiceDate,
    }));

    return NextResponse.json(mappedInvoices, { status: 200 });
  } catch (error) {
    console.error("Invoice fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}
