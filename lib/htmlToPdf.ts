import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";

export const generatePDF = async (htmlContent: string) => {
  const browser = await puppeteer.launch({
    executablePath: await chromium.executablePath,
    args: chromium.args,
    headless: true,
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0", timeout: 60000 });

  const pdfBuffer = await page.pdf({
    format: "a4",
    printBackground: true,
    margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
  });

  await browser.close();
  return pdfBuffer;
};
