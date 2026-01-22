export const runtime = "nodejs";

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    /* ---------------- READ FORM DATA ---------------- */
    const formData = await req.formData();

    const email = formData.get("email") as string;
    const invoice = JSON.parse(formData.get("invoice") as string);
    const totals = JSON.parse(formData.get("totals") as string);
    const totalInWords = formData.get("totalInWords") as string;
    const logoUrl = formData.get("logoUrl") as string;
    const files = formData.getAll("files") as File[];

    /* ---------------- BUILD ITEMS ---------------- */
    const itemsRows = invoice.items
      .map(
        (item: any) => `
        <tr>
          <td>${item.itemName}</td>
          <td>${item.hsn}</td>
          <td>${item.gst}%</td>
          <td>${item.qty}</td>
          <td>₹${item.rate.toFixed(2)}</td>
          <td>₹${(item.qty * item.rate).toFixed(2)}</td>
        </tr>
      `
      )
      .join("");

    /* ---------------- HTML TEMPLATE ---------------- */
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #000; padding: 6px; }
        th { background: #f3f3f3; }
        .header { display: flex; justify-content: space-between; }
        .logo { max-height: 70px; }
        .right { text-align: right; }
      </style>
    </head>
    <body>

      <div class="header">
        <h2>Invoice #${invoice.invoiceNumber}</h2>
        ${logoUrl ? `<img src="${logoUrl}" class="logo" />` : ""}
      </div>

      <p>
        <b>Billed By:</b><br/>
        ${invoice.billedBy.businessName}<br/>
        ${invoice.billedBy.address}, ${invoice.billedBy.city}, ${invoice.billedBy.country}<br/>
        Phone: ${invoice.billedBy.phone}<br/>
        GSTIN: ${invoice.billedBy.gstin}
      </p>

      <p>
        <b>Billed To:</b><br/>
        ${invoice.billedTo.businessName}<br/>
        ${invoice.billedTo.address}, ${invoice.billedTo.city}, ${invoice.billedTo.country}<br/>
        Phone: ${invoice.billedTo.phone}<br/>
        GSTIN: ${invoice.billedTo.gstin}
      </p>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>HSN</th>
            <th>GST%</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>${itemsRows}</tbody>
      </table>

      <p class="right">Amount: ₹${totals.amount.toFixed(2)}</p>
      <p class="right">CGST: ₹${totals.cgst.toFixed(2)}</p>
      <p class="right">SGST: ₹${totals.sgst.toFixed(2)}</p>
      <p class="right"><b>Grand Total: ₹${totals.grandTotal.toFixed(2)}</b></p>

      <p><i>${totalInWords}</i></p>

    </body>
    </html>
    `;

    /* ---------------- PUPPETEER (LOCAL + VERCEL SAFE) ---------------- */
    let browser: any;

    const isVercel =
      process.env.VERCEL === "1" ||
      process.env.VERCEL_ENV === "production";

    if (isVercel) {
      // ✅ Vercel
      const chromium = (await import("@sparticuz/chromium")).default;
      const puppeteer = await import("puppeteer-core");

      browser = await puppeteer.default.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    } else {
      // ✅ Localhost (Windows / Mac)
      const puppeteer = await import("puppeteer");

      browser = await puppeteer.default.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    /* ---------------- NODEMAILER ---------------- */
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    /* ---------------- EXTRA ATTACHMENTS ---------------- */
    const extraAttachments = await Promise.all(
      files.map(async (file) => ({
        filename: file.name,
        content: Buffer.from(await file.arrayBuffer()),
        contentType: file.type,
      }))
    );

    /* ---------------- SEND EMAIL ---------------- */
    await transporter.sendMail({
      from: `"Invoice App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Invoice ${invoice.invoiceNumber}`,
      text: "Please find the attached invoice.",
      attachments: [
        {
          filename: `Invoice-${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
        ...extraAttachments,
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("SEND INVOICE ERROR:", error);
    return NextResponse.json(
      { error: "Failed to send invoice" },
      { status: 500 }
    );
  }
}
