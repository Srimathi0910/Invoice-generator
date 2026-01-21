import puppeteer from "puppeteer";

export async function generateInvoicePDF(htmlContent: string, invoiceNumber: string) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // Load HTML without waiting for external resources
 await page.setContent(htmlContent, { waitUntil: "networkidle0", timeout: 60000 });


  // Generate PDF as Node Buffer
 const pdfBuffer = await page.pdf({
  format: "A4",
  printBackground: true,
  margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
});
;

  await browser.close();

  return { pdfBuffer, fileName: `Invoice-${invoiceNumber}.pdf` };
}
