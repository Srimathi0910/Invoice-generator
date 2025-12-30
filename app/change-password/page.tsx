"use client";

import { useState } from "react";
import { Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ChangePassword() {
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/change-password-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
      } else {
        alert("Password changed successfully ✅");
        router.push("/login");
      }
    } catch {
      setError("Network error");
      setLoading(false);
    }
  };

  return (
    // Added p-4 to prevent the card from touching screen edges on mobile
    <div className="min-h-screen flex items-center justify-center bg-[#D9D9D9] p-4">
      {/* Back Arrow - Adjusted position for better mobile access */}
      <Link href="/verify" className="absolute top-6 left-6 text-black hover:opacity-70 z-10">
        <ArrowLeft size={22} />
      </Link>

      {/* - Changed w-[420px] to w-full max-w-[420px]
          - Changed h-[560px] to md:h-[560px] and h-auto (flexible height for small screens)
      */}
      <div className="relative w-full max-w-[420px] md:h-[560px] h-auto bg-white rounded-xl shadow-lg p-8 md:p-10 flex flex-col items-center">
        
        <h2 className="text-[24px] font-bold text-black mb-4 text-center">
          Create New Password
        </h2>

        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#D9D9D9] mb-4 flex-shrink-0">
          <Lock size={28} className="text-black" />
        </div>

        <p className="text-sm text-black text-center mb-8">
          Your new password must be different from previously used passwords
        </p>

        {/* New Password */}
        <div className="relative w-full mb-4">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder=" "
            className="peer w-full border-b border-gray-400 py-2 outline-none bg-transparent"
          />
          <label
            className={`absolute left-0 text-gray-500 transition-all duration-300
              ${newPassword ? "-top-3 text-sm text-black" : "top-2 text-base"}
              peer-focus:-top-3 peer-focus:text-sm peer-focus:text-black`}
          >
            New Password
          </label>
        </div>

        {/* Confirm Password */}
        <div className="relative w-full mb-6">
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder=" "
            className="peer w-full border-b border-gray-400 py-2 outline-none bg-transparent"
          />
          <label
            className={`absolute left-0 text-gray-500 transition-all duration-300
              ${confirmPassword ? "-top-3 text-sm text-black" : "top-2 text-base"}
              peer-focus:-top-3 peer-focus:text-sm peer-focus:text-black`}
          >
            Confirm Password
          </label>
        </div>

        {error && <p className="text-red-500 mb-4 text-center text-sm">{error}</p>}

        <button
          type="button"
          onClick={handleChangePassword}
          disabled={loading}
          className={`text-black text-[18px] py-2 rounded-lg transition w-full md:w-3/4 mx-auto
            ${loading ? "bg-gray-300 cursor-not-allowed" : "bg-[#D9D9D9] hover:bg-gray-300"}`}
        >
          {loading ? "Changing..." : "Change Password"}
        </button>
      </div>
    </div>
  );
}
