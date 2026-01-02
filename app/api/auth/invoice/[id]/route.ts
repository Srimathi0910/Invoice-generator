import { connectDB } from "@/lib/db";
import Invoice from "@/models/Invoice";

export async function PATCH(req: Request) {
  await connectDB();

  try {
    const { paymentDate, paymentMethod, paymentStatus } = await req.json();
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id)
      return new Response(
        JSON.stringify({ success: false, error: "Invoice ID required" }),
        { status: 400 }
      );

    const invoice = await Invoice.findById(id);
    if (!invoice)
      return new Response(
        JSON.stringify({ success: false, error: "Invoice not found" }),
        { status: 404 }
      );

    // Update both the extras and the root status
    invoice.dueDate = paymentDate ? new Date(paymentDate) : invoice.dueDate;

    invoice.extras = {
      ...invoice.extras,
      paymentMethod: paymentMethod || invoice.extras?.paymentMethod,
      paymentStatus: paymentStatus || invoice.extras?.paymentStatus,
    };

    invoice.status = paymentStatus || invoice.status; // ✅ update root status

    await invoice.save();

    return new Response(
      JSON.stringify({ success: true, invoice }),
      { status: 200 }
    );
  } catch (err: any) {
    console.error(err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500 }
    );
  }
}
