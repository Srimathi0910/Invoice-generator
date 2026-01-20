import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

export async function generateInvoicePDF(html: string, invoiceNo: string) {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const dir = path.join(process.cwd(), "public", "invoices");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const fileName = `Invoice-${invoiceNo}.pdf`;
  const filePath = path.join(dir, fileName);

  await page.pdf({
    path: filePath,
    format: "A4",
    printBackground: true,
    margin: { top: "20mm", bottom: "20mm" },
  });

  await browser.close();

  return { url: `/invoices/${fileName}` };
}
