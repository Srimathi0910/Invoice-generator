"use client";

import { HelpCircle, User, Check } from "lucide-react";

export default function PaymentStatusPage() {
  return (
    <div className="min-h-screen bg-gray-300 flex justify-center p-10">
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-2xl">

        {/* Top Bar */}
        <div className="flex justify-end items-center px-6 py-4">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1 cursor-pointer">
              <HelpCircle size={16} />
              <span>Help</span>
            </div>
            <div className="flex items-center gap-1 cursor-pointer">
              <User size={16} />
              <span>John</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="bg-gray-200 px-8 py-4 text-3xl font-semibold">
          Payment Status
        </div>

        {/* Content */}
        <div className="px-8 py-14 flex flex-col items-center text-center">

          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-700 rounded-full flex items-center justify-center mb-6">
            <Check className="text-white" size={40} strokeWidth={3} />
          </div>

          {/* Success Text */}
          <h2 className="text-3xl font-semibold mb-4">
            Payment Success
          </h2>

          <p className="max-w-xl text-gray-700 mb-10">
            Thank you for paying your invoice. Your transaction has been
            recorded successfully.
          </p>

          {/* Payment Details Box */}
          <div className="w-full max-w-3xl border border-gray-600">

            <div className="border-b border-gray-600 py-3 text-lg font-semibold">
              Payment Details
            </div>

            <div className="grid grid-cols-2 gap-y-4 px-10 py-8 text-left text-sm">

              <span>Invoice Number</span>
              <span className="font-semibold">INV-2025-001</span>

              <span>Paid By</span>
              <span className="font-semibold">Tech systems</span>

              <span>Payment Method</span>
              <span className="font-semibold">UPI</span>

              <span>Payment Date</span>
              <span className="font-semibold">24/12/2025</span>

              <span>Amount Paid</span>
              <span className="font-semibold">Rs.23,600</span>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-center gap-6 pb-6 text-sm text-gray-600">
          <span>VISA</span>
          <span>RuPay</span>
          <span>UPI</span>
          <span>Razorpay</span>
        </div>

      </div>
    </div>
  );
}
