import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true },
    invoiceDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },

    billedBy: {
      businessName: String,
      address: String,
      city: String,
      country: String,
      phone: String,
      gstin: String,
    },

    billedTo: {
      businessName: String,
      address: String,
      city: String,
      country: String,
      phone: String,
      gstin: String,
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
      totalQty: Number,
      grandTotal: Number,
    },

    userEmail: String,
    userName: String,
  },
  { timestamps: true }
);

export default mongoose.models.Invoice ||
  mongoose.model("Invoice", invoiceSchema);
