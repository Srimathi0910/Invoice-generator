import cron from "node-cron";
import { sendInvoiceReminders } from "./lib/sendInvoiceReminders";
import { connectDB } from "./lib/db";

cron.schedule("0 7 * * *", async () => {
  console.log("⏱ Running daily invoice reminder...");
  await connectDB();
  await sendInvoiceReminders();
  console.log("✅ Daily reminders executed");
});
