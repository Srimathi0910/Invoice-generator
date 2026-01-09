export const runtime = "nodejs";

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import puppeteer from "puppeteer";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const email = formData.get("email") as string;
    const invoice = JSON.parse(formData.get("invoice") as string);
    const totals = JSON.parse(formData.get("totals") as string);
    const totalInWords = formData.get("totalInWords") as string;
    const logoUrl = formData.get("logoUrl") as string;

    // Get all uploaded files
    const files = formData.getAll("files") as File[];

    // Generate invoice table rows
    const itemsRows = invoice.items.map((item: any) => `
      <tr>
        <td>${item.itemName}</td>
        <td>${item.hsn}</td>
        <td>${item.gst}%</td>
        <td>${item.qty}</td>
        <td>&#8377;${item.rate.toFixed(2)}</td>
        <td>&#8377;${(item.qty * item.rate).toFixed(2)}</td>
      </tr>
    `).join("");

    // HTML template for PDF
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #000; padding: 8px; }
          th { background: #f3f3f3; }
          .header { display: flex; justify-content: space-between; align-items: center; }
          .logo { max-height: 70px; }
          .right { text-align: right; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Invoice #${invoice.invoiceNumber}</h2>
          ${logoUrl ? `<img src="${logoUrl}" class="logo" />` : ""}
        </div>

        <p><b>Billed By:</b><br/>${invoice.billedBy.businessName}<br/>${invoice.billedBy.address}, ${invoice.billedBy.city}, ${invoice.billedBy.country}<br/>Phone: ${invoice.billedBy.phone}<br/>GSTIN: ${invoice.billedBy.gstin}</p>
        <p><b>Billed To:</b><br/>${invoice.billedTo.businessName}<br/>${invoice.billedTo.address}, ${invoice.billedTo.city}, ${invoice.billedTo.country}<br/>Phone: ${invoice.billedTo.phone}<br/>GSTIN: ${invoice.billedTo.gstin}</p>

        <table>
          <thead>
            <tr>
              <th>Item</th><th>HSN</th><th>GST%</th>
              <th>Qty</th><th>Rate</th><th>Amount</th>
            </tr>
          </thead>
          <tbody>${itemsRows}</tbody>
        </table>

        <p class="right">Amount: &#8377;${totals.amount.toFixed(2)}</p>
        <p class="right">CGST: &#8377;${totals.cgst.toFixed(2)}</p>
        <p class="right">SGST: &#8377;${totals.sgst.toFixed(2)}</p>
        <p class="right"><b>Grand Total: &#8377;${totals.grandTotal.toFixed(2)}</b></p>
        <p><i>${totalInWords}</i></p>
      </body>
      </html>
    `;

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    // Nodemailer setup
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App Password recommended if using 2FA
      },
    });

    // Convert uploaded files to nodemailer attachments
    const extraAttachments = await Promise.all(
      files.map(async (file) => ({
        filename: file.name,
        content: Buffer.from(await file.arrayBuffer()),
        contentType: file.type,
      }))
    );

    // Send email
    await transporter.sendMail({
      from: `"Invoice App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Invoice ${invoice.invoiceNumber}`,
      text: "Please find attached invoice PDF along with other documents.",
      attachments: [
        {
          filename: `Invoice-${invoice.invoiceNumber}.pdf`,
          content: Buffer.from(pdfBuffer), // ensure it's a Buffer
          contentType: "application/pdf",
        },
        ...extraAttachments, // ✅ send all uploaded files
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to send invoice" }, { status: 500 });
  }
}
