import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    // ================= BASIC INFO =================
    username: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    // ================= AUTH =================
    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["company", "client"],
      required: true,
      default: "client",
    },

    // ================= CLIENT ↔ COMPANY LINK =================
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // company user
      default: null,
    },

    // ================= ACCOUNT STATUS =================
    isActive: {
      type: Boolean,
      default: true,
    },

    // ================= OTP / RESET =================
    otp: {
      type: String,
    },

    otpExpiry: {
      type: Date,
    },

    // ================= FIRST LOGIN TRACK =================
    isFirstLogin: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User ||
  mongoose.model("User", UserSchema);
