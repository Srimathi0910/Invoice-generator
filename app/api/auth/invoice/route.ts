import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import Invoice from "@/models/invoice";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import sendEmail from "@/lib/sendEmail";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    // Authenticate user
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    // Get formData
    const formData = await req.formData();
    const dataField = formData.get("data") as string;
    if (!dataField) {
      return NextResponse.json({ message: "Invoice data missing" }, { status: 400 });
    }
    const data = JSON.parse(dataField);

    // Prepare invoice object
    const invoiceData: any = {
      userId: decoded.id,
      invoiceNumber: data.invoiceNumber,
      invoiceDate: data.invoiceDate,
      dueDate: data.dueDate,
      billedBy: data.billedBy,
      billedTo: data.billedTo,
      items: data.items || [],
      totals: data.totals || {},
      extras: data.extras || { paymentStatus: "Unpaid", paymentMethod: "N/A" },
      totalInWords: data.totalInWords || "",
      status: "Unpaid",
    };

    // Create client user if not exists
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

      await sendEmail({
        to: clientUser.email,
        subject: "Invoice Dashboard Login",
        html: `
          <h3>Hello ${clientUser.username}</h3>
          <p>You have received an invoice.</p>
          <p><b>Email:</b> ${clientUser.email}</p>
          <p><b>Password:</b> ${tempPassword}</p>
          <a href="http://localhost:3000/login">Login</a>
        `,
      });
    }

    // Upload logo if provided
    const file = formData.get("file") as File;
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "business-logos" },
          (err, res) => (err ? reject(err) : resolve(res))
        ).end(buffer);
      });

      invoiceData.logoUrl = uploadResult.secure_url;
      console.log("Cloudinary logo URL:", uploadResult.secure_url);
    }

    // Save invoice
    const invoice = data._id
      ? await Invoice.findByIdAndUpdate(data._id, invoiceData, { new: true })
      : await Invoice.create(invoiceData);

    return NextResponse.json({ success: true, invoice }, { status: 200 });
  } catch (err: any) {
    console.error("Invoice + logo error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// Updated GET: fetch all invoices OR a single invoice by ID
export async function GET(req: NextRequest) {
  await connectDB();

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id"); // ✅ get invoice ID from query string

    if (id) {
      // If ID is provided, return single invoice
      const invoice = await Invoice.findById(id).lean();
      if (!invoice) return NextResponse.json({ success: false, error: "Invoice not found" }, { status: 404 });

      return NextResponse.json(invoice);
    } else {
      // Otherwise, return all invoices
      const invoices = await Invoice.find().sort({ invoiceDate: -1 }).lean();
      return NextResponse.json(invoices);
    }
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
