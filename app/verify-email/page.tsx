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
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Optional improvement: auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);

    const enteredOtp = otp.join("");
    const email = localStorage.getItem("resetEmail");

    if (!email) {
      setError("Email not found. Go back and enter email.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/verify-otp-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: enteredOtp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid OTP");
        setLoading(false);
      } else {
        alert("OTP verified successfully ✅");
        router.push("/change-password");
      }
    } catch {
      setError("Network error");
      setLoading(false);
    }
  };

  return (
    // Added p-4 to give space around the card on mobile devices
    <div className="min-h-screen flex items-center justify-center bg-[#D9D9D9] p-4">
      {/* Back Arrow - Ensured z-index so it's clickable on all layouts */}
      <Link href="/forgot" className="absolute top-6 left-6 text-black hover:opacity-70 z-10">
        <ArrowLeft size={22} />
      </Link>

      {/* - Changed w-[420px] to w-full max-w-[420px]
          - Changed h-[520px] to md:h-[520px] and h-auto for mobile
          - Adjusted padding for small screens (p-8 on mobile, p-10 on desktop)
      */}
      <div className="relative w-full max-w-[420px] md:h-[520px] h-auto bg-white rounded-xl shadow-lg p-8 md:p-10 flex flex-col items-center">
        <h2 className="text-[24px] font-bold text-black mb-4 text-center">Verify Email</h2>

        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#D9D9D9] mb-6 flex-shrink-0">
          <Mail size={28} className="text-black" />
        </div>

        <p className="text-gray-600 text-sm text-center mb-8">
          Please enter the <b>4-digit code</b> sent to your Email
        </p>

        {/* OTP Inputs - flex-wrap ensures they don't break on extremely narrow screens */}
        <div className="flex gap-3 md:gap-4 mb-6 justify-center">
          {otp.map((value, i) => (
            <input
              key={i}
              id={`otp-${i}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={value}
              onChange={(e) => handleChange(i, e.target.value)}
              className="w-12 h-12 text-center text-lg border-b-2 border-gray-400 outline-none focus:border-black bg-transparent"
            />
          ))}
        </div>

        {error && <p className="text-red-500 mb-4 text-center text-sm">{error}</p>}

        <button
          type="button"
          onClick={handleVerify}
          disabled={loading}
          className={`text-black text-[18px] py-2 rounded-lg transition w-full md:w-3/4 mx-auto mt-auto
            ${loading ? "bg-gray-300 cursor-not-allowed" : "bg-[#D9D9D9] hover:bg-gray-300"}`}
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </div>
    </div>
  );
}