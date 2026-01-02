import { connectDB } from "@/lib/db";
import Invoice from "@/models/Invoice";

export async function GET() {
  await connectDB();

  try {
    const invoices = await Invoice.find().sort({ invoiceDate: -1 });

    const payments = invoices.map((inv) => ({
      _id: inv._id.toString(),
      invoiceNumber: inv.invoiceNumber,
      clientName: inv.billedTo.businessName,
      paymentDate: inv.dueDate?.toISOString() || "",
      paymentMethod: inv.extras?.paymentMethod || "N/A",
      paymentStatus: inv.extras?.paymentStatus || inv.status || "Unpaid", // ✅ use extras first, fallback to status
      amount: inv.totals?.grandTotal || 0,
    }));

    return new Response(JSON.stringify({ success: true, payments }), { status: 200 });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}

