import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true },
  invoiceDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },

  billedBy: {
    country: String,
    businessName: String,
    email: String,       // ✅ Make sure this exists
    phone: String,
    gstin: String,
    address: String,
    city: String,
  },

  billedTo: {
    country: String,
    businessName: String,
    email: String,       // ✅ Make sure this exists
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

  extras: {
    discount: Number,
    charges: Number,
    round: Number,
  },

  totals: {
    amount: Number,
    cgst: Number,
    sgst: Number,
    grandTotal: Number,
    totalQty: Number,
  },

  totalInWords: String,
});

export default mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);
