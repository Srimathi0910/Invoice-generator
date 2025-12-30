"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock } from "lucide-react";

export default function Login() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: "", general: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ email: "", password: "", general: "" });
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.field) {
          setErrors((prev) => ({ ...prev, [data.field]: data.message }));
        } else {
          setErrors((prev) => ({
            ...prev,
            general: data.error || "Login failed",
          }));
        }
      } else {
        localStorage.setItem("user", JSON.stringify(data.user));
        router.replace("/dashboard");
      }
    } catch {
      setErrors((prev) => ({
        ...prev,
        general: "Network error. Please try again.",
      }));
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "peer w-full border-b border-gray-400 py-2 outline-none bg-transparent";

  const labelClass = (value: string) =>
    `absolute left-0 transition-all duration-300 ${
      value ? "-top-3 text-sm text-black" : "top-2 text-base text-gray-500"
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#D9D9D9] p-4">
      <div className="flex flex-col md:flex-row w-full max-w-[900px] md:h-[586px] bg-white rounded-xl shadow-lg overflow-hidden p-3">
        {/* LEFT FORM */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-8 md:px-10">
          <h2 className="text-2xl font-bold mb-6 text-black text-center">
            Login
          </h2>

          {errors.general && (
            <p className="text-red-500 text-center mb-4">
              {errors.general}
            </p>
          )}

          <form className="space-y-6 md:p-10" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="relative">
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder=" "
                className={inputClass}
                autoComplete="email"
              />
              <label htmlFor="email" className={labelClass(formData.email)}>
                Email
              </label>
              <Mail className="absolute right-0 top-2 text-gray-500" size={18} />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                placeholder=" "
                className={inputClass}
                autoComplete="current-password"
              />
              <label htmlFor="password" className={labelClass(formData.password)}>
                Password
              </label>
              <Lock className="absolute right-0 top-2 text-gray-500" size={18} />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`bg-[#D9D9D9] text-[20px] text-black py-2 rounded-lg hover:bg-gray-300 transition w-full md:w-3/4 mx-auto block ${
                loading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-4 text-center text-[16px] md:text-[20px]">
            <Link href="/forgot-password-email" className="underline">
              Forgot Password?
            </Link>
          </p>

          <p className="mt-2 text-center text-[16px] md:text-[20px]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline font-medium">
              Signup
            </Link>
          </p>
        </div>

        {/* RIGHT IMAGE */}
        <div className="relative w-full md:w-1/2 h-48 md:h-auto p-3">
          <Image
            src="/assets/login/login-img.png"
            alt="Login"
            fill
            className="object-cover rounded-xl"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center rounded-xl p-4">
            <h1 className="text-white text-2xl md:text-4xl font-bold tracking-wide bg-white/20 px-8 py-4 md:px-16 md:py-8 backdrop-blur-md rounded-2xl shadow-lg text-center">
              Welcome <br /> Back
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}
