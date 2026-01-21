// Only server-side
import  chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";

export async function generateInvoicePDF(html: string, invoiceNumber: string) {
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath,
    headless: true,
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({ format: "a4", printBackground: true });
  await browser.close();

  return { pdfBuffer, fileName: `Invoice-${invoiceNumber}.pdf` };
}

