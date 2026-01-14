import mongoose from "mongoose";
import Invoice from "@/models/invoice";
import jwt from "jsonwebtoken";

const MONGODB_URI = process.env.MONGODB_URI!;

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URI);
}

export async function GET(req: Request) {
  try {
    await connectDB();

    // ---------- AUTH ----------
    const cookie = req.headers.get("cookie") || "";
    const tokenMatch = cookie.match(/accessToken=([^;]+)/);
    if (!tokenMatch) {
      return new Response("Unauthorized", { status: 401 });
    }

    const token = tokenMatch[1];

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return new Response("Invalid token", { status: 401 });
    }

    const userEmail = decoded.email; // logged-in user email
    if (!userEmail) return new Response("Email not found in token", { status: 401 });

    // ---------- FETCH INVOICES ONLY WHERE LOGGED-IN USER IS BILLED BY ----------
    const invoices = await Invoice.find(
      { "billedBy.email": userEmail, billedTo: { $exists: true } },
      { billedTo: 1 } // only fetch billedTo info
    ).lean();

    const clientsMap = new Map<string, any>();

    invoices.forEach((inv: any) => {
      if (!inv.billedTo) return;

      const key = inv.billedTo.email || inv.billedTo.gstin;

      if (!clientsMap.has(key)) {
        clientsMap.set(key, {
          id: key,
          name: inv.billedTo.businessName,
          email: inv.billedTo.email || "",
          phone: inv.billedTo.phone || "",
          gstin: inv.billedTo.gstin || "",
          totalInvoices: 1,
        });
      } else {
        clientsMap.get(key).totalInvoices += 1;
      }
    });

    return new Response(JSON.stringify(Array.from(clientsMap.values())), { status: 200 });
  } catch (error) {
    console.error("CLIENT API ERROR:", error);
    return new Response("Failed to fetch clients", { status: 500 });
  }
}
