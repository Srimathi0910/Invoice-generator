import mongoose from "mongoose";
import { sendEmail } from "../lib/sendInvoiceReminders.ts"; // reuse your email function
import nodemailer from "nodemailer";

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true },
  invoiceDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },

  billedBy: {
    country: String,
    businessName: String,
    email: String,
    phone: String,
    gstin: String,
    address: String,
    city: String,
    currency: { type: String, default: "INR" },
    defaultGstRate: { type: Number, default: 18 },
    invoicePrefix: { type: String, default: "INV-" },
    bankName: String,
    accountNumber: String,
  },

  billedTo: {
    country: String,
    businessName: String,
    email: String,
    phone: String,
    gstin: String,
    address: String,
    city: String,
    contactPerson: String,
  },

  items: [
    {
      itemName: { type: String, required: true },
      hsn: String,
      gst: Number,
      qty: { type: Number, required: true },
      rate: { type: Number, required: true },
    },
  ],

  extras: {
    discount: Number,
    charges: Number,
    round: Number,
    paymentMethod: {
      type: String,
      enum: ["NA", "UPI", "Credit/Debit Card", "Net Banking", "Wallet"],
      default: "NA",
    },
  },

  totals: {
    amount: Number,
    cgst: Number,
    sgst: Number,
    grandTotal: Number,
    totalQty: Number,
  },

  totalInWords: String,

  status: { type: String, enum: ["Paid", "Unpaid", "Overdue"], default: "Unpaid" },

  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  logoUrl: String,

  files: {
    signature: [{ filename: String, url: String }],
    notes: [{ filename: String, url: String }],
    terms: [{ filename: String, url: String }],
    attachments: [{ filename: String, url: String }],
    additionalInfo: [{ filename: String, url: String }],
    contactDetails: [{ filename: String, url: String }],
  },
});

// -----------------------------
// Post-save hook to detect status changes
// -----------------------------
invoiceSchema.post("save", async function (doc, next) {
  try {
    // Only send email if status was modified
    if (this.isModified("status")) {
      const previousStatus = this.get("status"); // previous value
      const newStatus = doc.status;

      console.log(
        `Status changed for invoice ${doc.invoiceNumber}: ${previousStatus} → ${newStatus}`
      );

      const recipientEmail = doc.billedTo?.email;
      if (!recipientEmail) {
        console.log(`⚠️ No recipient email for invoice ${doc.invoiceNumber}`);
        return next();
      }

      // Setup transporter
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER!,
          pass: process.env.EMAIL_PASS!,
        },
        tls: { rejectUnauthorized: false },
      });

      // Send emails based on new status
      if (newStatus === "Paid") {
        await sendEmail(transporter, doc, recipientEmail, "PaymentReceived");
      } else if (newStatus === "Overdue") {
        await sendEmail(transporter, doc, recipientEmail, "Overdue");
      }
    }
  } catch (err) {
    console.error("Error in post-save hook:", err);
  }

  next();
});


export default mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);
