import 'dotenv/config';
import cron from "node-cron";
import { sendInvoiceReminders } from "./lib/sendInvoiceReminders.ts"; // <- relative path, no .ts

cron.schedule("0 9 * * *", async () => {
  console.log("⏱ CRON TEST RUNNING...");
  await sendInvoiceReminders();
});





