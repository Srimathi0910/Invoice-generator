import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true },
  clientName: { type: String, required: true },
  paymentDate: { type: Date, required: true },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, enum: ["Paid", "Unpaid", "Overdue"], default: "Unpaid" },
  amount: { type: Number, required: true },
});

export default mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
