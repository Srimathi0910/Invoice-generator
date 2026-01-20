import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import Invoice from "@/models/invoice";
import User from "@/models/User";
import sendEmail from "@/lib/sendEmail";
import cloudinary from "@/lib/cloudinary";
import { generateInvoicePDF } from "@/lib/htmlToPdf"; // Puppeteer HTML-to-PDF generator

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    // ---------- AUTH ----------
    const token = req.cookies.get("accessToken")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

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

    // ---------- CLEAN EMAIL ----------
    if (invoiceData.billedTo?.email)
      invoiceData.billedTo.email = String(invoiceData.billedTo.email).trim().toLowerCase();
    if (invoiceData.billedBy?.email)
      invoiceData.billedBy.email = String(invoiceData.billedBy.email).trim().toLowerCase();

    // ---------- CREATE CLIENT USER IF NOT EXISTS ----------
    let clientUser = await User.findOne({ email: invoiceData.billedTo.email });
    if (!clientUser) {
      const generatePassword = (length = 10) => {
        const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lower = "abcdefghijklmnopqrstuvwxyz";
        const numbers = "0123456789";
        const symbols = "!@#$%^&*()";
        const all = upper + lower + numbers + symbols;

        let password = "";
        password += upper[Math.floor(Math.random() * upper.length)];
        password += lower[Math.floor(Math.random() * lower.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += symbols[Math.floor(Math.random() * symbols.length)];
        for (let i = 4; i < length; i++) password += all[Math.floor(Math.random() * all.length)];

        return password.split("").sort(() => 0.5 - Math.random()).join("");
      };

      const tempPassword = generatePassword(10);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      clientUser = await User.create({
        username: invoiceData.billedTo.businessName,
        email: invoiceData.billedTo.email,
        phone: invoiceData.billedTo.phone || "",
        contactPerson: data.billedTo.contactPerson || "",
        password: hashedPassword,
        role: "client",
      });

      // Send login email
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
          .upload_stream({ folder: "business-logos" }, (err, result) => (err ? reject(err) : resolve(result)))
          .end(buffer);
      });
      invoiceData.logoUrl = uploadResult.secure_url;
    }

    // ---------- CREATE OR UPDATE INVOICE ----------
    let invoice: any;
    const existingInvoice = await Invoice.findOne({
      invoiceNumber: invoiceData.invoiceNumber,
      "billedTo.email": invoiceData.billedTo.email,
    });
    if (existingInvoice) {
      invoice = await Invoice.findByIdAndUpdate(existingInvoice._id, invoiceData, { new: true });
    } else {
      invoice = await Invoice.create(invoiceData);
    }

    // ---------- GENERATE STYLED PDF ----------
    // Render invoice HTML as string
    const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <link rel="preconnect" href="https://fonts.googleapis.com">


    <title>Invoice ${invoiceData.invoiceNumber}</title>
    <style>
      body {
       font-family: "Roboto", Arial, Helvetica, sans-serif;
        margin: 0;
        padding: 20px;
        background-color: #f9f9f9;
      }
      .invoice-container {
        max-width: 800px;
        margin: 0 auto;
        background: #fff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
      }
      .flex-between {
        display: flex;
        justify-content: space-between;
      }
      h1, h2, h3 {
        margin: 0 0 10px 0;
      }
      p {
        margin: 2px 0;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }
      th, td {
        border: 1px solid #333;
        padding: 8px;
        text-align: left;
      }
      th {
        background-color: #f0f0f0;
      }
      .text-right {
        text-align: right;
      }
      .totals {
        margin-top: 20px;
        text-align: right;
        font-weight: bold;
      }
      .logo {
        max-height: 60px;
        margin-bottom: 10px;
      }
      /* Mobile friendly */
      @media (max-width: 600px) {
        .flex-between {
          flex-direction: column;
        }
      }
    </style>
  </head>
  <body>
    <div class="invoice-container">
      <!-- Header -->
      <div class="flex-between">
        <div>
          <h2>${invoiceData.billedBy.businessName}</h2>
          <p>${invoiceData.billedBy.address}, ${invoiceData.billedBy.city}</p>
          <p>${invoiceData.billedBy.country}</p>
          <p>Phone: ${invoiceData.billedBy.phone}</p>
          <p>GSTIN: ${invoiceData.billedBy.gstin}</p>
        </div>
        <div class="text-right">
          ${invoiceData.logoUrl ? `<img src="${invoiceData.logoUrl}" class="logo" />` : ""}
          <p>Invoice Number: ${invoiceData.invoiceNumber}</p>
          <p>Date: ${invoiceData.invoiceDate}</p>
          <p>Due Date: ${invoiceData.dueDate}</p>
        </div>
      </div>

      <!-- Billed To -->
      <div style="margin-top: 20px;">
        <h3>Billed To (Client)</h3>
        <p>${invoiceData.billedTo.businessName}</p>
        <p>${invoiceData.billedTo.address}, ${invoiceData.billedTo.city}</p>
        <p>${invoiceData.billedTo.country}</p>
        <p>Phone: ${invoiceData.billedTo.phone}</p>
        <p>GSTIN: ${invoiceData.billedTo.gstin}</p>
      </div>

      <!-- Items Table -->
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>HSN</th>
            <th>GST %</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoiceData.items
        .map(
          (item: any) => `
              <tr>
                <td>${item.itemName}</td>
                <td>${item.hsn || "-"}</td>
                <td>${item.gst || 0}</td>
                <td>${item.qty}</td>
                <td>₹${item.rate.toFixed(2)}</td>
                <td>₹${(item.qty * item.rate).toFixed(2)}</td>
              </tr>
            `
        )
        .join("")}
        </tbody>
      </table>

      <!-- Totals -->
      <div class="totals">
        <p>Amount: ₹${invoiceData.totals.amount.toFixed(2)}</p>
        <p>CGST: ₹${invoiceData.totals.cgst.toFixed(2)}</p>
        <p>SGST: ₹${invoiceData.totals.sgst.toFixed(2)}</p>
        <p>Discount: ₹${invoiceData.extras?.discount || 0}</p>
        <p>Additional Charges: ₹${invoiceData.extras?.charges || 0}</p>
        <p style="font-size: 18px;">Grand Total: ₹${invoiceData.totals.grandTotal.toFixed(2)}</p>
        ${invoiceData.showTotalInWords
        ? `<p style="font-style: italic;">Total in words: ${invoiceData.totalInWords}</p>`
        : ""
      }
      </div>
    </div>
  </body>
</html>
`;

    // Generate PDF using Puppeteer
    const { url: pdfUrl } = await generateInvoicePDF(htmlContent, invoiceData.invoiceNumber);

    // Save PDF URL in invoice document
    invoice.pdfUrl = pdfUrl;
    await invoice.save();

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
    const token = req.cookies.get("accessToken")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const { email, role } = decoded;

    if (!email || !role) {
      return NextResponse.json({ success: false, message: "Invalid token data" }, { status: 401 });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    let filter: any = {};
    if (role === "company") {
      filter = { "billedBy.email": cleanEmail };
    } else if (role === "client") {
      filter = { "billedTo.email": cleanEmail };
    } else {
      return NextResponse.json({ success: false, message: "Invalid role" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const invoice = await Invoice.findOne({ _id: id, ...filter }).lean();
      if (!invoice) {
        return NextResponse.json({ success: false, message: "Invoice not found or unauthorized" }, { status: 404 });
      }
      return NextResponse.json({ success: true, invoice });
    }

    const invoices = await Invoice.find(filter).sort({ invoiceDate: -1 }).lean();
    return NextResponse.json({ success: true, invoices });
  } catch (error: any) {
    console.error("Fetch invoice error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
