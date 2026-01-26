"use client";

import { useState, useEffect } from "react";
import { Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function ChangePassword() {
  const router = useRouter();
    const pathname = usePathname(); // get current path

  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    type: "info",
  });
  useEffect(() => {
  const searchParams = new URLSearchParams(window.location.search);
  const t = searchParams.get("token");
  const e = searchParams.get("email");

  // ❌ Invalid token OR invalid email on protected page
  if (!t || (!e && pathname !== "/")) {
    setPopup({
      open: true,
      message: "Invalid reset link",
      type: "error",
    });
    router.push("/login");
    return;
  }

  // ✅ Only set valid values
  if (t) setToken(t);
  if (e) setEmail(e);
}, [router, pathname]);

const handleChangePassword = async () => {
  setError("");
  setSuccess("");

  // ✅ Validate passwords match
  if (newPassword !== confirmPassword) {
    setError("Passwords do not match");
    return;
  }

  setLoading(true);

  try {
    const res = await fetch("/api/auth/change-password-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        newPassword,
        confirmPassword,
        token,
        email,
      }),
    });

    const data = await res.json();

    // ❌ Handle errors
    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }

    // ✅ Success
    setSuccess(data.message);

    // Redirect safely only if not already on "/"
    if (pathname !== "/") {
      setTimeout(() => router.push("/login"), 1000);
    }
  } catch (err) {
    console.error(err);
    setError("Network error");
  } finally {
    setLoading(false);
  }
};


  /* Tailwind floating label styles */
  const inputClass =
    "peer w-full border-b border-gray-400 py-2 pr-10 bg-transparent outline-none placeholder-transparent";

  const labelClass =
    "absolute left-0 top-2 text-gray-500 transition-all duration-300 pointer-events-none " +
    "peer-focus:-top-3 peer-focus:text-sm peer-focus:text-black " +
    "peer-[&:not(:placeholder-shown)]:-top-3 peer-[&:not(:placeholder-shown)]:text-sm peer-[&:not(:placeholder-shown)]:text-black";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#D9D9D9] p-4">
      <Link
        href="/login"
        className="absolute top-6 left-6 text-black hover:opacity-70 z-10"
      >
        <ArrowLeft size={22} />
      </Link>

      <div className="w-full max-w-[420px] bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-[25px] font-bold text-center mb-4">
          Change Password
        </h2>

        <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-[#D9D9D9] mb-6">
          <Lock size={28} />
        </div>

        {/* New Password */}
        <div className="relative mb-6">
          <input
            type={showNewPassword ? "text" : "password"}
            placeholder=" "
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputClass}
          />
          <label className={labelClass}>New Password</label>

          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-0 top-2 text-gray-500 hover:text-black"
          >
            {showNewPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative mb-4">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder=" "
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
          />
          <label className={labelClass}>Confirm Password</label>

          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-0 top-2 text-gray-500 hover:text-black"
          >
            {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>

        {error && <p className="text-red-500 mb-2">{error}</p>}
        {success && <p className="text-green-600 mb-2">{success}</p>}

        <button
          onClick={handleChangePassword}
          disabled={loading}
          className={`w-full py-2 rounded-lg bg-[#D9D9D9] hover:bg-gray-300 ${
            loading ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Changing..." : "Change Password"}
        </button>
      </div>
      {popup.open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <div className="glass rounded-2xl px-8 py-6 w-[320px] text-center text-black w-[320px] text-center">
            <h3
              className={`text-lg font-semibold mb-3 ${
                popup.type === "success"
                  ? "text-green-600"
                  : popup.type === "error"
                    ? "text-red-600"
                    : "text-gray-700"
              }`}
            >
              {popup.type === "success"
                ? "Success"
                : popup.type === "error"
                  ? "Error"
                  : "Info"}
            </h3>

            <p className="text-white mb-5">{popup.message}</p>

            <button
              onClick={() => setPopup({ ...popup, open: false })}
              className="px-5 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
