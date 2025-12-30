import { NextResponse } from "next/server";
import Invoice from "@/models/invoice";
import { connectDB } from "@/lib/db";

export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();

    if (data._id) {
      // Update existing invoice
      const invoiceId = data._id;
      delete data._id; // prevent _id overwrite
      const updatedInvoice = await Invoice.findByIdAndUpdate(
        invoiceId,
        data,
        { new: true, upsert: false } // upsert=false ensures no new doc is created
      );

      if (!updatedInvoice) {
        return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, invoice: updatedInvoice });
    }

    // Create new invoice
    const newInvoice = new Invoice(data);
    await newInvoice.save();
    return NextResponse.json({ success: true, invoice: newInvoice });
  } catch (err: any) {
    console.error("Error saving invoice:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
