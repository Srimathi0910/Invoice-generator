"use client";

import { useState } from "react";
import { Lock, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSend = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        setError(data.message || data.error || "Something went wrong");
      } else {
        setSuccess(data.message || "OTP sent to your email address");
        setTimeout(() => {
          // ✅ Pass email as query param to VerifyEmail page
          router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        }, 1000);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#D9D9D9] p-4">
      <Link
        href="/login"
        className="absolute top-6 left-6 text-black hover:opacity-70 transition z-10"
      >
        <ArrowLeft size={22} />
      </Link>

      <div className="relative w-full max-w-[420px] md:h-[500px] h-auto bg-white rounded-xl shadow-lg p-8 md:p-10 flex flex-col items-center">
        <h2 className="text-[25px] font-bold text-black mb-4 text-center">
          Forgot Password
        </h2>

        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#D9D9D9] mb-6 flex-shrink-0">
          <Lock size={28} className="text-black" />
        </div>

        <p className="text-gray-600 text-sm text-center mb-8">
          Please enter your Email Address to receive a <br className="hidden md:block" />
          verification code
        </p>

        <div className="relative w-full mb-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder=" "
            className="peer w-full border-b border-gray-400 py-2 outline-none bg-transparent"
          />
          <label
            className={`absolute left-0 text-gray-500 transition-all duration-300
              ${email ? "-top-3 text-sm text-black" : "top-2 text-base"}
              peer-focus:-top-3 peer-focus:text-sm peer-focus:text-black`}
          >
            Email
          </label>
          <Mail className="absolute right-0 top-2 text-gray-500" size={18} />
        </div>

        {error && <p className="text-red-500 mb-2 text-center text-sm">{error}</p>}
        {success && <p className="text-green-600 mb-2 text-center text-sm">{success}</p>}

        <button
          type="button"
          onClick={handleSend}
          disabled={loading}
          className={`text-black text-[20px] py-2 rounded-lg transition w-full md:w-3/4 mx-auto mt-auto
            ${loading ? "bg-gray-300 cursor-not-allowed" : "bg-[#D9D9D9] hover:bg-gray-300"}`}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
