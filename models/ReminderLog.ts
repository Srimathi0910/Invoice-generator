import mongoose from "mongoose";

const ReminderLogSchema = new mongoose.Schema({
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Invoice",
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
});

export default mongoose.models.ReminderLog ||
  mongoose.model("ReminderLog", ReminderLogSchema);
