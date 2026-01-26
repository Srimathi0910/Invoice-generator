import { connectDB } from "@/lib/db";
import Invoice from "@/models/invoice";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  await connectDB();

  try {
    // ---------- AUTH ----------
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/accessToken=([^;]+)/);
    if (!tokenMatch) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    const token = tokenMatch[1];

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    const userEmail = decoded.email; // make sure email is in your JWT
    if (!userEmail) {
      return new Response(
        JSON.stringify({ success: false, error: "Email not found in token" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    // ---------- FETCH ONLY LOGGED-IN USER'S INVOICES ----------
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

    return new Response(JSON.stringify({ success: true, payments }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Payments API error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
