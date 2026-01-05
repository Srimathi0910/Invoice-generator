import { connectDB } from "@/lib/db";
import Invoice from "@/models/Invoice";

export async function GET() {
  await connectDB();

  try {
    // Fetch all invoices, sorted by invoiceDate descending
    const invoices = await Invoice.find().sort({ invoiceDate: -1 }).lean();

    const payments = invoices.map((inv) => ({
      _id: inv._id.toString(),
      invoiceNumber: inv.invoiceNumber,
      clientName: inv.billedTo?.businessName || "N/A",
      paymentDate: inv.dueDate ? new Date(inv.dueDate).toISOString() : "",
      paymentMethod: inv.extras?.paymentMethod || "UPI", // default to UPI
      paymentStatus: inv.extras?.paymentStatus || inv.status || "Unpaid", // fallback to root status
      amount: inv.totals?.grandTotal || 0,
    }));

    return new Response(JSON.stringify({ success: true, payments }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error(err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
