import mongoose from "mongoose";
import Invoice from "@/models/Invoice";

const MONGODB_URI = process.env.MONGODB_URI!;

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URI);
}

export async function GET() {
  try {
    await connectDB();

    const invoices = await Invoice.find(
      { billedTo: { $exists: true } },
      { billedTo: 1 }
    ).lean();

    const clientsMap = new Map<string, any>();

    invoices.forEach((inv: any) => {
      if (!inv.billedTo) return;

      // ✅ Use email as unique key (BEST PRACTICE)
      const key = inv.billedTo.email || inv.billedTo.gstin;

      if (!clientsMap.has(key)) {
  clientsMap.set(key, {
    id: key,
    name: inv.billedTo.businessName,
    email: inv.billedTo.email || "",   // ensure email is always present
    phone: inv.billedTo.phone || "",
    gstin: inv.billedTo.gstin || "",
    totalInvoices: 1,
  });
} else {
  clientsMap.get(key).totalInvoices += 1;
}

    });

    return new Response(
      JSON.stringify(Array.from(clientsMap.values())),
      { status: 200 }
    );
  } catch (error) {
    console.error("CLIENT API ERROR:", error);
    return new Response("Failed to fetch clients", { status: 500 });
  }
}
