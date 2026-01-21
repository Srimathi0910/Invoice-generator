import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

export async function generateInvoicePDF(htmlContent: string, invoiceNumber: string) {
  // Determine executablePath: use chrome-aws-lambda on serverless, or local Puppeteer for dev
  const executablePath = await chromium.executablePath || undefined;

  const browser = await puppeteer.launch({
    headless: true,
    args: chromium.args,           // required for Vercel
    defaultViewport: chromium.defaultViewport,
    executablePath: executablePath,
  });

  const page = await browser.newPage();

  // Load HTML content
  await page.setContent(htmlContent, { waitUntil: "networkidle0", timeout: 60000 });

  // Generate PDF as Node Buffer
  const pdfBuffer = await page.pdf({
    format: "a4",
    printBackground: true,
    margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
  });

  await browser.close();

  return {
    pdfBuffer,
    fileName: `Invoice-${invoiceNumber}.pdf`,
  };
}
