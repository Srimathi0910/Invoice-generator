"use client";

import { Phone, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function VerifyEmail() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#D9D9D9]">
        <Link
          href="/forgot"
          className="absolute top-6 left-6 text-black hover:opacity-70"
        >
          <ArrowLeft size={22} />
        </Link>
      {/* White Card */}
      <div className="relative w-[420px] h-[520px] bg-white rounded-xl shadow-lg p-10 flex flex-col items-center">

        {/* Back Icon */}
        

        {/* Title */}
        <h2 className="text-[24px] font-bold text-black mb-4">
          Verify Phone Number 
        </h2>

        {/* Email Icon */}
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#D9D9D9] mb-6">
          <Phone size={28} className="text-black" />
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm text-center mb-8">
          Please enter the <b>4-digit code</b> sent to<br/> your phone Number
        </p>

        {/* OTP Inputs */}
        <div className="flex gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <input
              key={i}
              type="text"
              maxLength={1}
              className="w-12 h-12 text-center text-lg border-b-2 border-gray-400 outline-none focus:border-black"
            />
          ))}
        </div>

        {/* Resend Code */}
        <p className="text-sm mb-10">
          Didn&apos;t receive the code?{" "}
          <span className="underline font-medium cursor-pointer">
            Resend code
          </span>
        </p>

        {/* Verify Button */}
        <button
          type="button"
          className="bg-[#D9D9D9] text-black text-[18px] py-2 rounded-lg
          hover:bg-gray-300 transition w-3/4 mx-auto"
        >
          Verify
        </button>
      </div>
    </div>
  );
}
