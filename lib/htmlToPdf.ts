export async function generateInvoicePDF(
  html: string,
  invoiceNumber: string
) {
  let browser;

  const isVercel =
    process.env.VERCEL === "1" ||
    process.env.VERCEL_ENV === "production";

  if (isVercel) {
    // ✅ Vercel / Serverless
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

  // ✅ IMPORTANT: Use networkidle0 for fonts & styles
  await page.setContent(html, {
    waitUntil: "networkidle0",
    timeout: 0,
  });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      top: "20px",
      bottom: "20px",
      left: "20px",
      right: "20px",
    },
  });

  await browser.close();

  return {
    pdfBuffer,
    fileName: `Invoice-${invoiceNumber}.pdf`,
  };
}
