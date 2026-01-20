// /lib/pdfGenerator.ts
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function generateInvoicePDF(invoiceData: any) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 750]);

  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawText("Invoice", { x: 50, y: height - 50, size: 30, font, color: rgb(0, 0, 0) });
  page.drawText(`Invoice Number: ${invoiceData.invoiceNumber}`, { x: 50, y: height - 100, font, size: 14 });
  page.drawText(`Invoice Date: ${invoiceData.invoiceDate}`, { x: 50, y: height - 120, font, size: 14 });
  page.drawText(`Due Date: ${invoiceData.dueDate}`, { x: 50, y: height - 140, font, size: 14 });

  page.drawText(`Billed By: ${invoiceData.billedBy?.businessName || ""}`, { x: 50, y: height - 180, font, size: 14 });
  page.drawText(`Billed To: ${invoiceData.billedTo?.businessName || ""}`, { x: 50, y: height - 200, font, size: 14 });

  let y = height - 240;
  invoiceData.items.forEach((item: any, i: number) => {
    page.drawText(
      `${i + 1}. ${item.description || ""} | Qty: ${item.quantity || ""} | Price: ${item.price || ""} | Total: ${item.total || ""}`,
      { x: 50, y, font, size: 12 }
    );
    y -= 20;
  });

  page.drawText(`Total: ${invoiceData.totals?.grandTotal || ""}`, { x: 50, y: y - 20, font, size: 14 });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
