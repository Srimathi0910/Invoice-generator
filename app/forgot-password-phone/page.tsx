"use client";

import { useState } from "react";
import { Lock, Phone, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSend = async () => {
    setError("");

    if (!phone) {
      setError("Phone number is required");
      return;
    }

    try {
      const res = await fetch("/api/auth/forgot-password-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        localStorage.setItem("resetPhone", phone);
        router.push("/verify-phone");
      }
    } catch {
      setError("Network error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#D9D9D9]">
      <Link href="/login" className="absolute top-6 left-6 text-black">
        <ArrowLeft size={22} />
      </Link>

      <div className="w-[420px] h-[500px] bg-white rounded-xl shadow-lg p-10 flex flex-col items-center">
        <h2 className="text-[25px] font-bold mb-4">Forgot Password</h2>

        <div className="w-16 h-16 rounded-full bg-[#D9D9D9] flex items-center justify-center mb-6">
          <Lock size={28} />
        </div>

        <p className="text-sm text-center mb-8">
          Enter your <b>Phone Number</b> to receive OTP
        </p>

        {/* Phone Input */}
        <div className="relative w-full mb-6">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder=" "
            className="peer w-full border-b border-gray-400 py-2 outline-none bg-transparent"
          />
          <label
            className={`absolute left-0 transition-all
              ${phone ? "-top-3 text-sm text-black" : "top-2 text-base text-gray-500"}
              peer-focus:-top-3 peer-focus:text-sm peer-focus:text-black`}
          >
            Phone Number
          </label>
          <Phone className="absolute right-0 top-2 text-gray-500" size={18} />
        </div>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <button
          onClick={handleSend}
          className="bg-[#D9D9D9] py-2 rounded-lg w-3/4 text-lg"
        >
          Send OTP
        </button>
      </div>
    </div>
  );
}
