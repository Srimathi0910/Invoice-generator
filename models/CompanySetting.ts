import mongoose from "mongoose";

const CompanySettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    companyName: String,
    email: String,
    address: String,
    gstin: String,
    phone: String,
    stateCode: String,

    logoUrl: String,

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
