// app/api/auth/payments/route.ts
import { connectDB } from "@/lib/db";
import Invoice from "@/models/Invoice";

export async function GET() {
  await connectDB();

  try {
    const invoices = await Invoice.find().sort({ invoiceDate: -1 });
    const payments = invoices.map((inv) => ({
      _id: inv._id,
      invoiceNumber: inv.invoiceNumber,
      clientName: inv.billedTo.businessName,
      paymentDate: inv.dueDate, // You can create a field paymentDate in invoice or use dueDate
      paymentMethod: inv.extras?.paymentMethod || "N/A", // optional field
      paymentStatus: inv.extras?.paymentStatus || "Unpaid", // optional field
      amount: inv.totals?.grandTotal || 0,
    }));

    return new Response(JSON.stringify({ success: true, payments }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, error: "Failed to fetch payments" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
