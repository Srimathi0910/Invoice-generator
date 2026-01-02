// models/CompanySettings.ts
import mongoose from "mongoose";

const CompanySettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one company per user
    },

    companyName: String,
    email: String,
    address: String,
    gstin: String,
    stateCode: String,

    logoUrl: String, // store IMAGE URL, not file

    currency: {
      type: String,
      default: "INR",
    },
    gstRate: {
      type: Number,
      default: 18,
    },
    invoicePrefix: {
      type: String,
      default: "INV-",
    },

    bankName: String,
    accountNumber: String,
    upiId: String,
  },
  { timestamps: true }
);

export default mongoose.models.CompanySettings ||
  mongoose.model("CompanySettings", CompanySettingsSchema);
