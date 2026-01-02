import { NextResponse } from "next/server";
import Invoice from "@/models/Invoice";
import { connectDB } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  await connectDB();

  const authHeader = req.headers.get("authorization");
  if (!authHeader) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const token = authHeader.split(" ")[1];
  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    jwt.verify(token, process.env.JWT_SECRET!);
  } catch (err) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  // Fetch latest invoice (remove userId filter for now)
  const invoice = await Invoice.findOne().sort({ invoiceDate: -1 }).lean();

  if (!invoice) {
    return NextResponse.json({}, { status: 404 });
  }

  return NextResponse.json({
    billedBy: invoice.billedBy,
    logoUrl: invoice.logoUrl || "",
  });
}
