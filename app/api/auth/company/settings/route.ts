import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import jwt from "jsonwebtoken";
import Invoice from "@/models/invoice";

/* ---------------- GET COMPANY SETTINGS ---------------- */
export async function GET(req: NextRequest) {
  await connectDB();

  try {
    const token = req.cookies.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.id || decoded.userId || decoded._id;

    const invoice = await Invoice.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean();

    if (!invoice || !invoice.billedBy) {
      return NextResponse.json({ billedBy: {}, logoUrl: "" });
    }

    return NextResponse.json({
      billedBy: invoice.billedBy,
      logoUrl: invoice.logoUrl || "",
    });
  } catch (err: any) {
    console.error("SETTINGS GET ERROR:", err);

    return NextResponse.json(
      {
        error:
          err.name === "TokenExpiredError"
            ? "ACCESS_TOKEN_EXPIRED"
            : "Unauthorized",
      },
      { status: 401 }
    );
  }
}

/* ---------------- UPDATE COMPANY SETTINGS ---------------- */
export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const token = req.cookies.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = decoded.id || decoded.userId || decoded._id;

    if (!userId) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const { billedBy, logoUrl } = await req.json();

    await Invoice.updateMany(
      { userId },
      {
        $set: {
          billedBy,
          logoUrl,
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("SETTINGS POST ERROR:", err);

    return NextResponse.json(
      { success: false, message: "Error updating settings" },
      { status: 500 }
    );
  }
}
