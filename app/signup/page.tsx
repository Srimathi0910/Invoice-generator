"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { User, Mail, Phone, Lock } from "lucide-react";

export default function Signup() {
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

  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    setErrors({ ...errors, [id]: "", general: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setErrors({ ...errors, general: "" });

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
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ ...errors, general: data.error || "Something went wrong" });
      } else {
        setSuccess(data.message);
        setFormData({ username: "", email: "", phone: "", password: "" });
      }
    } catch (err) {
      setErrors({ ...errors, general: "Network error" });
    }
  };

  const inputClass = "peer w-full border-b border-gray-400 py-2 outline-none";

  const labelClass = (value: string) =>
    `absolute left-0 text-gray-500 transition-all duration-300 ${
      value ? "-top-3 text-sm text-black" : "top-2 text-base"
    }`;

  return (
    // Added p-4 for mobile spacing
    <div className="min-h-screen flex items-center justify-center bg-[#D9D9D9] p-4">
      {/* - flex-col for mobile, flex-row for desktop
          - w-full max-w-[1000px] instead of fixed width
          - h-auto for mobile, fixed h-[586px] for desktop
      */}
      <div className="flex flex-col md:flex-row w-full max-w-[1000px] md:h-[586px] bg-white rounded-xl shadow-lg overflow-hidden p-3">
        
        {/* LEFT IMAGE - Hidden or resized on mobile */}
        <div className="relative w-full md:w-1/2 h-48 md:h-auto p-3">
          <Image
            src="/assets/signup/signup-img.png"
            alt="Signup Image"
            fill
            className="object-cover rounded-xl"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center rounded-xl p-4">
            <h1 className="text-white text-2xl md:text-4xl font-bold tracking-wide bg-white/20 px-8 py-4 md:px-16 md:py-8 backdrop-blur-[5px] rounded-2xl shadow-lg text-center">
              Join Us
              <br />
              today
            </h1>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-8 md:px-10">
          <h2 className="text-2xl font-bold mb-6 text-black text-center">
            Signup
          </h2>

          {errors.general && (
            <p className="text-red-500 mb-2 text-center">{errors.general}</p>
          )}
          {success && <p className="text-green-500 mb-2 text-center">{success}</p>}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Username */}
            <div className="relative">
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={handleChange}
                placeholder=" "
                className={inputClass}
              />
              <label htmlFor="username" className={labelClass(formData.username)}>
                Username
              </label>
              <User className="absolute right-0 top-2 text-gray-500" size={18} />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div className="relative">
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                placeholder=" "
                className={inputClass}
              />
              <label htmlFor="email" className={labelClass(formData.email)}>
                Email
              </label>
              <Mail className="absolute right-0 top-2 text-gray-500" size={18} />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="relative">
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder=" "
                className={inputClass}
              />
              <label htmlFor="phone" className={labelClass(formData.phone)}>
                Phone Number
              </label>
              <Phone className="absolute right-0 top-2 text-gray-500" size={18} />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
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
              />
              <label htmlFor="password" className={labelClass(formData.password)}>
                Password
              </label>
              <Lock className="absolute right-0 top-2 text-gray-500" size={18} />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              className="bg-[#D9D9D9] text-[18px] md:text-[20px] flex align-items justify-center text-black py-2 rounded-lg hover:bg-gray-300 transition w-full md:w-3/4 mx-auto block cursor-pointer"
            >
              Sign Up
            </button>
          </form>

          <p className="mt-4 text-center text-[16px] md:text-[20px]">
            Already have an account?{" "}
            <Link href="/login" className="text-black-600 font-medium underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
