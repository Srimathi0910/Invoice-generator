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
      itemName: String,
      hsn: String,
      gst: Number,
      qty: Number,
      rate: Number,
    },
  ],

  // Extras now includes payment info explicitly
  extras: {
    discount: Number,
    charges: Number,
    round: Number,
    paymentMethod: {
      type: String,
    enum: ["UPI", "Credit/Debit Card", "Net Banking", "Wallet"],
    default: null,
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

  logoUrl: String, // optional
});

export default mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);
