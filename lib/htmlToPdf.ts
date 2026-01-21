import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";

export async function generateInvoicePDF(html: string, invoiceNumber: string) {
  // Determine executablePath depending on environment
  const isProduction = process.env.NODE_ENV === "production";

  const browser = await puppeteer.launch({
    args: isProduction ? chromium.args : [],
    defaultViewport: chromium.defaultViewport,
    executablePath: isProduction
      ? await chromium.executablePath // Vercel / Lambda
      : undefined, // Local Chrome
    headless: true,
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({ format: "a4", printBackground: true });
  await browser.close();

  return { pdfBuffer, fileName: `Invoice-${invoiceNumber}.pdf` };
}
