import { sendInvoiceReminders } from "../../../lib/sendInvoiceReminders";
import type { NextApiRequest, NextApiResponse } from "next";
export default async function handler(req:NextApiRequest,res: NextApiResponse) {
  try {
    await sendInvoiceReminders();
    res.status(200).json({ message: "Invoice reminders sent!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send reminders" });
  }
}
