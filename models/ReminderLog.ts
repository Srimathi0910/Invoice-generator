import mongoose from "mongoose";

const ReminderLogSchema = new mongoose.Schema({
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Invoice",
  },
  reminderDate: Date,
});

export default mongoose.models.ReminderLog ||
  mongoose.model("ReminderLog", ReminderLogSchema);
