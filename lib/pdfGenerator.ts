import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";

export async function generateInvoicePDF(invoiceData: any) {
  // 1️⃣ Create PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 750]);
  const { height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // 2️⃣ Add invoice title
  page.drawText("Invoice", { x: 50, y: height - 50, size: 30, font, color: rgb(0, 0, 0) });

  // 3️⃣ Add invoice info
  page.drawText(`Invoice Number: ${invoiceData.invoiceNumber}`, { x: 50, y: height - 100, size: 14, font });
  page.drawText(`Invoice Date: ${invoiceData.invoiceDate}`, { x: 50, y: height - 120, size: 14, font });
  page.drawText(`Due Date: ${invoiceData.dueDate}`, { x: 50, y: height - 140, size: 14, font });

  // 4️⃣ Billed By / To
  page.drawText(`Billed By: ${invoiceData.billedBy?.businessName || ""}`, { x: 50, y: height - 180, size: 14, font });
  page.drawText(`Billed To: ${invoiceData.billedTo?.businessName || ""}`, { x: 50, y: height - 200, size: 14, font });

  // 5️⃣ Items Table
  let y = height - 240;
  invoiceData.items.forEach((item: any, i: number) => {
    page.drawText(
      `${i + 1}. ${item.description || ""} | Qty: ${item.quantity || ""} | Price: ${item.price || ""} | Total: ${item.total || ""}`,
      { x: 50, y, font, size: 12 }
    );
    y -= 20;
  });

  // 6️⃣ Totals
  page.drawText(`Grand Total: ${invoiceData.totals?.grandTotal || 0}`, { x: 50, y: y - 20, size: 14, font });

  // 7️⃣ Save PDF as bytes
  const pdfBytes = await pdfDoc.save();

  // 8️⃣ Save PDF file in /public/invoices
  const fileName = `Invoice-${invoiceData.invoiceNumber}.pdf`;
  const folderPath = path.join(process.cwd(), "public", "invoices");

  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

  const filePath = path.join(folderPath, fileName);
  fs.writeFileSync(filePath, pdfBytes);

  return { fileName, filePath, url: `/invoices/${fileName}` };
}
