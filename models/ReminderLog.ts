import mongoose from "mongoose";

const ReminderLogSchema = new mongoose.Schema({
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Invoice",
    required: true,
  },
  invoiceNumber: {
    type: String,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  emailSentTo: {
    type: String,
    required: true,
  },
  reminderDate: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    enum: ["Reminder", "Overdue", "PaymentReceived"], // ✅ this field stores status
    required: true,
  },
});


export default mongoose.models.ReminderLog ||
  mongoose.model("ReminderLog", ReminderLogSchema);
