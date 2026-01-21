"use client";

import { useState } from "react";
import { Mail, Lock, ArrowLeft } from "lucide-react";
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

      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setSuccess(data.message);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#D9D9D9] p-4">
      <Link href="/login" className="absolute top-6 left-6 text-black hover:opacity-70 z-10">
        <ArrowLeft size={22} />
      </Link>
      <div className="relative w-full max-w-[420px] bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
        <h2 className="text-[25px] font-bold text-black mb-4 text-center">Forgot Password</h2>
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#D9D9D9] mb-6">
          <Lock size={28} className="text-black" />
        </div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full border-b border-gray-400 py-2 outline-none bg-transparent mb-4"
        />
        {error && <p className="text-red-500 mb-2">{error}</p>}
        {success && <p className="text-green-600 mb-2">{success}</p>}
        <button
          type="button"
          onClick={handleSend}
          disabled={loading}
          className={`w-full py-2 rounded-lg bg-[#D9D9D9] hover:bg-gray-300 ${loading ? "cursor-not-allowed" : ""}`}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </div>
    </div>
  );
}
