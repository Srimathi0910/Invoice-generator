import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true },
    userName: String,
    invoiceNumber: String,
    invoiceDate: String,
    dueDate: String,
    billedBy: Object,
    billedTo: Object,
    items: Array,
    extras: Object,
    totals: Object,
    uploadedFiles: Object,
    status: { type: String, default: "Unpaid" },
  },
  { timestamps: true }
);

export default mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);
