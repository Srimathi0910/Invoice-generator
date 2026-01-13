import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db";
import Invoice from "@/models/invoice";
import User from "@/models/User";
import sendEmail from "@/lib/sendEmail";
import cloudinary from "@/lib/cloudinary";

/* =========================
   POST: Create / Update Invoice
   ========================= */
export async function POST(req: NextRequest) {
  await connectDB();

  try {
    // ---------- AUTH ----------
    const token = req.cookies.get("accessToken")?.value;
    if (!token)
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    // ---------- FORM DATA ----------
    const formData = await req.formData();
    const dataField = formData.get("data");

    if (!dataField || typeof dataField !== "string") {
      return NextResponse.json({ success: false, message: "Invoice data missing" }, { status: 400 });
    }

    const data = JSON.parse(dataField);

    // ---------- INVOICE OBJECT ----------
    const invoiceData: any = {
      userId: decoded.id,
      invoiceNumber: data.invoiceNumber,
      invoiceDate: data.invoiceDate,
      dueDate: data.dueDate,
      billedBy: data.billedBy,
      billedTo: data.billedTo,
      items: data.items ?? [],
      totals: data.totals ?? {},
      extras: data.extras ?? { paymentStatus: "Unpaid", paymentMethod: "N/A" },
      totalInWords: data.totalInWords ?? "",
      status: "Unpaid",
    };

    // ---------- CREATE CLIENT USER ----------
    let clientUser = await User.findOne({ email: invoiceData.billedTo.email });
    if (!clientUser) {
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      clientUser = await User.create({
        username: invoiceData.billedTo.businessName,
        email: invoiceData.billedTo.email,
        phone: invoiceData.billedTo.phone || "",
        contactPerson: data.billedTo.contactPerson || "",
        password: hashedPassword,
        role: "client",
      });

      // ---------- SEND EMAIL ----------
      try {
        await sendEmail({
          to: clientUser.email,
          subject: "Invoice Dashboard Login",
          html: `
            <h3>Hello ${clientUser.username}</h3>
            <p>You have received an invoice.</p>
            <p><b>Email:</b> ${clientUser.email}</p>
            <p><b>Password:</b> ${tempPassword}</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/login">Login</a>
          `,
        });
        console.log(`Email sent to ${clientUser.email}`);
      } catch (err) {
        console.error("Failed to send email:", err);
      }
    }

    // ---------- LOGO UPLOAD ----------
    const file = formData.get("file");
    if (file && file instanceof File && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const uploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "business-logos" }, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          })
          .end(buffer);
      });

      invoiceData.logoUrl = uploadResult.secure_url;
    }

    // ---------- SAVE / UPDATE INVOICE ----------
    const invoice = data._id
      ? await Invoice.findByIdAndUpdate(data._id, invoiceData, { new: true })
      : await Invoice.create(invoiceData);

    return NextResponse.json({ success: true, invoice });
  } catch (error: any) {
    console.error("Invoice error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/* =========================
   GET: Fetch Invoices
   ========================= */
export async function GET(req: NextRequest) {
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const invoice = await Invoice.findById(id).lean();
      if (!invoice) return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });
      return NextResponse.json({ success: true, invoice });
    }

    const invoices = await Invoice.find().sort({ invoiceDate: -1 }).lean();
    return NextResponse.json({ success: true, invoices });
  } catch (error: any) {
    console.error("Fetch invoice error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
