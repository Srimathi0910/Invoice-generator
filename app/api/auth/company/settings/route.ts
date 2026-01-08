import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import jwt from "jsonwebtoken";
import Invoice from "@/models/invoice";

/* ---------------- GET COMPANY SETTINGS ---------------- */
export async function GET(req: NextRequest) {
  await connectDB();

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    const userId = decoded.userId || decoded.id || decoded._id;
    if (!userId) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    // Fetch the latest invoice for this user
    const invoice = await Invoice.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean();

    if (!invoice) {
      return NextResponse.json({ billedBy: null, logoUrl: "" }, { status: 200 });
    }

    return NextResponse.json({
      billedBy: invoice.billedBy,
      logoUrl: invoice.logoUrl || "",
    });
  } catch (err) {
    console.error("SETTINGS GET ERROR:", err);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}

/* ---------------- UPDATE COMPANY SETTINGS ---------------- */
export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    const userId = decoded.userId || decoded.id || decoded._id;
    if (!userId) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const data = await req.json();

    // Update ALL invoices for this user
    await Invoice.updateMany(
      { userId },
      {
        $set: {
          "billedBy.businessName": data.companyName,
          "billedBy.phone": data.phone,
          "billedBy.gstin": data.gstin,
          "billedBy.address": data.address,
          "billedBy.city": data.city,
          "billedBy.country": data.country,
          "billedBy.currency": data.currency,
          "billedBy.defaultGstRate": data.gstRate,
          "billedBy.invoicePrefix": data.invoicePrefix, // ✅ Will update correctly
          "billedBy.bankName": data.bankName,
          "billedBy.accountNumber": data.accountNumber,
          logoUrl: data.logoUrl,
        },
      }
    );

    return NextResponse.json({ message: "Settings updated successfully" });
  } catch (err) {
    console.error("SETTINGS POST ERROR:", err);
    return NextResponse.json({ message: "Error updating settings" }, { status: 500 });
  }
}
