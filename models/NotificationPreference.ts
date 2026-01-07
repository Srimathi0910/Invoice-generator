import mongoose from "mongoose";

const NotificationPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    dueDateReminder: { type: Boolean, default: true },
    overdueAlert: { type: Boolean, default: true },
    paymentReceived: { type: Boolean, default: true },

    reminderPeriod: {
      type: Number,
      enum: [1, 3, 5],
      default: 3,
    },

    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "light",
    },
  },
  { timestamps: true }
);

export default mongoose.models.NotificationPreference ||
  mongoose.model("NotificationPreference", NotificationPreferenceSchema);
