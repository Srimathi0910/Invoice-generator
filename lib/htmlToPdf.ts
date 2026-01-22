export async function generateInvoicePDF(
  html: string,
  invoiceNumber: string
) {
  let browser;

  const isVercel =
    process.env.VERCEL === "1" ||
    process.env.VERCEL_ENV === "production";

  if (isVercel) {
    // ✅ Vercel (Linux serverless)
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
    });
  }

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "a4",
    printBackground: true,
  });

  await browser.close();

  return {
    pdfBuffer,
    fileName: `Invoice-${invoiceNumber}.pdf`,
  };
}
