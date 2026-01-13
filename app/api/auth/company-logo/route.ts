import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db";
import Invoice from "@/models/invoice";
import User from "@/models/User";
import sendEmail from "@/lib/sendEmail";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    /* ---------- AUTH ---------- */
    const token = req.cookies.get("accessToken")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    /* ---------- FORM DATA ---------- */
    const formData = await req.formData();
    const dataField = formData.get("data");

    if (!dataField || typeof dataField !== "string") {
      return NextResponse.json({ success: false, message: "Invoice data missing" }, { status: 400 });
    }

    const data = JSON.parse(dataField);

    /* ---------- BASE INVOICE ---------- */
    const invoiceData: any = {
      userId: decoded.id,
      invoiceNumber: data.invoiceNumber,
      invoiceDate: data.invoiceDate,
      dueDate: data.dueDate,
      billedBy: data.billedBy,
      billedTo: data.billedTo,
      items: data.items ?? [],
      totals: data.totals ?? {},
      extras: data.extras ?? {},
      totalInWords: data.totalInWords ?? "",
      status: "Unpaid",
      files: {
        signature: [],
        notes: [],
        terms: [],
        attachments: [],
        additionalInfo: [],
        contactDetails: [],
      },
    };

    /* ---------- CREATE CLIENT USER ---------- */
    if (data.billedTo?.email) {
      let clientUser = await User.findOne({ email: data.billedTo.email });

      if (!clientUser) {
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        clientUser = await User.create({
          username: data.billedTo.businessName,
          email: data.billedTo.email,
          phone: data.billedTo.phone || "",
          contactPerson: data.billedTo.contactPerson || "",
          password: hashedPassword,
          role: "client",
        });

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
      }
    }

    /* ---------- LOGO UPLOAD ---------- */
    const logoFile = formData.get("logo");
    if (logoFile instanceof File && logoFile.size > 0) {
      const buffer = Buffer.from(await logoFile.arrayBuffer());

      const upload: any = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "company-logos" },
          (err, res) => (err ? reject(err) : resolve(res))
        ).end(buffer);
      });

      invoiceData.logoUrl = upload.secure_url;
    }

    /* ---------- FILE UPLOADS (CORRECT WAY) ---------- */
    const fileFields = [
      "signature",
      "notes",
      "terms",
      "attachments",
      "additionalInfo",
      "contactDetails",
    ];

    for (const field of fileFields) {
      const files = formData.getAll(field);

      for (const file of files) {
        if (file instanceof File && file.size > 0) {
          const buffer = Buffer.from(await file.arrayBuffer());

          const upload: any = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              { folder: `invoices/${field}` },
              (err, res) => (err ? reject(err) : resolve(res))
            ).end(buffer);
          });

          invoiceData.files[field].push({
            filename: file.name,
            url: upload.secure_url,
          });
        }
      }
    }

    /* ---------- SAVE / UPDATE ---------- */
    const invoice = data._id
      ? await Invoice.findByIdAndUpdate(data._id, invoiceData, { new: true })
      : await Invoice.create(invoiceData);

    return NextResponse.json({ success: true, invoice });
  } catch (error: any) {
    console.error("Invoice error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
