import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import CompanySettings from "@/models/CompanySetting";
import Invoice from "@/models/invoice";
import jwt from "jsonwebtoken";
import cloudinary from "@/lib/cloudinary";

/* ------------------ AUTH ------------------ */
const getUserIdFromToken = (req: NextRequest) => {
  const token = req.cookies.get("accessToken")?.value;
  if (!token) return null;

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded.id;
  } catch {
    return null;
  }
};

/* ------------------ GET SETTINGS ------------------ */
export async function GET(req: NextRequest) {
  await connectDB();

  const userId = getUserIdFromToken(req);
  if (!userId) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const settings = await CompanySettings.findOne({ userId });

  return NextResponse.json({
    success: true,
    data: settings || {},
  });
}

/* ------------------ UPDATE SETTINGS ------------------ */
export async function POST(req: NextRequest) {
  await connectDB();

  const userId = getUserIdFromToken(req);
  if (!userId) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const raw = formData.get("data");

    if (!raw || typeof raw !== "string") {
      return NextResponse.json(
        { success: false, message: "Invalid data" },
        { status: 400 }
      );
    }

    const data = JSON.parse(raw);
    let logoUrl = data.logoUrl || "";

    /* ---------- Cloudinary upload ---------- */
    const logo = formData.get("logo");
    if (logo instanceof File && logo.size > 0) {
      const buffer = Buffer.from(await logo.arrayBuffer());

      const upload: any = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "company-logos" }, (err, res) =>
            err ? reject(err) : resolve(res)
          )
          .end(buffer);
      });

      logoUrl = upload.secure_url;
    }

    /* ---------- SAVE (MATCHES FLAT SCHEMA) ---------- */
    const updated = await CompanySettings.findOneAndUpdate(
      { userId },
      {
        userId,
        companyName: data.companyName,
        email: data.email,
        address: data.address,
        gstin: data.gstin,
        phone: data.phone, 
        stateCode: data.stateCode,

        currency: data.currency || "INR",
        gstRate: data.gstRate ?? 18,
        invoicePrefix: data.invoicePrefix || "INV-",

        bankName: data.bankName,
        accountNumber: data.accountNumber,
        upiId: data.upiId || "",

        logoUrl,
      },
      { upsert: true, new: true }
    );

    /* ---------- UPDATE LOGO IN INVOICES ---------- */
    await Invoice.updateMany(
      { userId },
      { $set: { logoUrl } }
    );

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    console.error("Settings update error:", err);
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
