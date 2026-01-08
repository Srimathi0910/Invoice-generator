import mongoose from "mongoose";

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
      enum: ["UPI", "Credit/Debit Card", "Net Banking", "Wallet"],
      default: undefined,
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
});

export default mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);
