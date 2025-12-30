"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Lock } from "lucide-react";

export default function Signup() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    general: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    setErrors({ ...errors, [id]: "", general: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ username: "", email: "", phone: "", password: "", general: "" });

    let valid = true;
    const newErrors = { username: "", email: "", phone: "", password: "", general: "" };

    if (!formData.username.trim()) {
      newErrors.username = "Username cannot be empty";
      valid = false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.(com|gmail\.com)$/i;
    if (!emailPattern.test(formData.email)) {
      newErrors.email = "Email must end with .com or gmail.com";
      valid = false;
    }

    const phonePattern = /^\d{10}$/;
    if (!phonePattern.test(formData.phone)) {
      newErrors.phone = "Phone number must be exactly 10 digits";
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password cannot be empty";
      valid = false;
    }

    if (!valid) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ ...errors, general: data.error || "Something went wrong" });
      } else {
        router.push("/signup-success"); // ✅ redirect
      }
    } catch {
      setErrors({ ...errors, general: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "peer w-full border-b border-gray-400 py-2 outline-none";

  const labelClass = (value: string) =>
    `absolute left-0 text-gray-500 transition-all duration-300 ${
      value ? "-top-3 text-sm text-black" : "top-2 text-base"
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#D9D9D9] p-4">
      <div className="flex flex-col md:flex-row w-full max-w-[1000px] md:h-[586px] bg-white rounded-xl shadow-lg overflow-hidden p-3">

        {/* LEFT IMAGE */}
        <div className="relative w-full md:w-1/2 h-48 md:h-auto p-3">
          <Image
            src="/assets/signup/signup-img.png"
            alt="Signup"
            fill
            className="object-cover rounded-xl"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-white text-3xl md:text-4xl font-bold bg-white/20 px-10 py-6 backdrop-blur rounded-xl">
              Join Us <br /> Today
            </h1>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-8 md:px-10">
          <h2 className="text-2xl font-bold mb-6 text-center">Signup</h2>

          {errors.general && (
            <p className="text-red-500 text-center mb-3">{errors.general}</p>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Username */}
            <div className="relative">
              <input id="username" value={formData.username} onChange={handleChange} placeholder=" " className={inputClass} />
              <label className={labelClass(formData.username)}>Username</label>
              <User className="absolute right-0 top-2 text-gray-500" size={18} />
              {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
            </div>

            {/* Email */}
            <div className="relative">
              <input id="email" type="email" value={formData.email} onChange={handleChange} placeholder=" " className={inputClass} />
              <label className={labelClass(formData.email)}>Email</label>
              <Mail className="absolute right-0 top-2 text-gray-500" size={18} />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div className="relative">
              <input id="phone" value={formData.phone} onChange={handleChange} placeholder=" " className={inputClass} />
              <label className={labelClass(formData.phone)}>Phone Number</label>
              <Phone className="absolute right-0 top-2 text-gray-500" size={18} />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
            </div>

            {/* Password */}
            <div className="relative">
              <input id="password" type="password" value={formData.password} onChange={handleChange} placeholder=" " className={inputClass} />
              <label className={labelClass(formData.password)}>Password</label>
              <Lock className="absolute right-0 top-2 text-gray-500" size={18} />
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`bg-[#D9D9D9] py-2 rounded-lg w-full md:w-3/4 mx-auto flex justify-center items-center text-lg ${
                loading ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-300"
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                  Signing Up...
                </span>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <p className="mt-4 text-center">
            Already have an account?{" "}
            <Link href="/login" className="underline font-medium">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
