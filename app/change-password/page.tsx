"use client";

import { useState, useEffect } from "react";
import { Lock, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ChangePassword() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const t = searchParams.get("token");
    const e = searchParams.get("email");

    if (!t || !e) {
      alert("Invalid reset link");
      router.push("/login");
      return;
    }

    setToken(t);
    setEmail(e);
  }, [router]);

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/change-password-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword, confirmPassword, token, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setSuccess(data.message);
        setTimeout(() => router.push("/login"), 1000);
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
        <h2 className="text-[25px] font-bold text-black mb-4 text-center">Change Password</h2>
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#D9D9D9] mb-6">
          <Lock size={28} className="text-black" />
        </div>

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border-b border-gray-400 py-2 mb-4 outline-none bg-transparent"
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border-b border-gray-400 py-2 mb-4 outline-none bg-transparent"
        />

        {error && <p className="text-red-500 mb-2">{error}</p>}
        {success && <p className="text-green-600 mb-2">{success}</p>}

        <button
          onClick={handleChangePassword}
          disabled={loading}
          className={`w-full py-2 rounded-lg bg-[#D9D9D9] hover:bg-gray-300 ${loading ? "cursor-not-allowed" : ""}`}
        >
          {loading ? "Changing..." : "Change Password"}
        </button>
      </div>
    </div>
  );
}
