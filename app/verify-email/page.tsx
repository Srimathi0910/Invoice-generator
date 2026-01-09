"use client";

import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VerifyEmail() {
  const router = useRouter();

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (index: number, value: string) => {
    const newOtp = [...otp];

    if (value.length > 1) {
      const pasteValues = value.slice(0, 4 - index).split("");
      pasteValues.forEach((v, i) => (newOtp[index + i] = v));
      setOtp(newOtp);
      const nextIndex = Math.min(index + pasteValues.length, 3);
      document.getElementById(`otp-${nextIndex}`)?.focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) document.getElementById(`otp-${index + 1}`)?.focus();
    if (!value && index > 0) document.getElementById(`otp-${index - 1}`)?.focus();
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);

    const enteredOtp = otp.join("");

    if (!enteredOtp || enteredOtp.length < 4) {
      setError("Please enter a valid 4-digit OTP");
      setLoading(false);
      return;
    }

    try {
      console.log("Calling verify-otp-email API...", { otp: enteredOtp });

      const res = await fetch("/api/auth/verify-otp-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: enteredOtp }),
      });

      const data = await res.json();
      console.log("API response:", data);

      if (!res.ok) {
        setError(data.error || "Invalid OTP");
      } else {
        alert(data.message || "OTP verified successfully ✅");
        router.push("/change-password");
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#D9D9D9] p-4">
      <Link
        href="/forgot-password-email"
        className="absolute top-6 left-6 text-black hover:opacity-70 z-10"
      >
        <ArrowLeft size={22} />
      </Link>

      <div className="relative w-full max-w-[420px] md:h-[520px] h-auto bg-white rounded-xl shadow-lg p-8 md:p-10 flex flex-col items-center">
        <h2 className="text-[24px] font-bold text-black mb-4 text-center">
          Verify Email
        </h2>

        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#D9D9D9] mb-6 flex-shrink-0">
          <Mail size={28} className="text-black" />
        </div>

        <p className="text-gray-600 text-sm text-center mb-8">
          Please enter the <b>4-digit code</b> sent to your Email
        </p>

        <div className="flex gap-3 md:gap-4 mb-6 justify-center">
          {otp.map((value, i) => (
            <input
              key={i}
              id={`otp-${i}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              disabled={loading}
              value={value}
              onChange={(e) => handleChange(i, e.target.value)}
              className="w-12 h-12 text-center text-lg border-b-2 border-gray-400 outline-none focus:border-black bg-transparent"
            />
          ))}
        </div>

        {error && (
          <p className="text-red-500 mb-4 text-center text-sm">{error}</p>
        )}

        <button
          type="button"
          onClick={handleVerify}
          disabled={loading}
          className={`cursor-pointer text-black text-[18px] py-2 rounded-lg transition w-full md:w-3/4 mx-auto mt-auto
            ${loading ? "bg-gray-300 cursor-not-allowed" : "bg-[#D9D9D9] hover:bg-gray-300"}`}
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </div>
    </div>
  );
}
