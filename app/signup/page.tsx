"use client";
import { authFetch} from "@/utils/authFetch"; 
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Lock } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";

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
  const [shake, setShake] = useState(false);

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

    const emailPattern = /^[^\s@]+@[^\s@]+\.(com|in)$/i;
    if (!emailPattern.test(formData.email)) {
      newErrors.email = "Email must end with .com or .in";
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
      setShake(true);
      setTimeout(() => setShake(false), 500);
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
        setShake(true);
        setTimeout(() => setShake(false), 500);
      } else {
        router.push("/signup-success");
      }
    } catch {
      setErrors({ ...errors, general: "Network error" });
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "peer w-full border-b border-gray-400 py-2 outline-none";

  const labelClass = (value: string) =>
    `absolute left-0 text-gray-500 transition-all duration-300 ${
      value ? "-top-3 text-sm text-black" : "top-2 text-base"
    }`;

  const shakeVariants: Variants = {
    idle: { x: 0 },
    shake: { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.5 } },
  };

  // Entry animation for image and form
  const entryVariant: Variants = {
    hidden: { opacity: 0, y: -50 },
    visible: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay },
    }),
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#D9D9D9] p-4">
      <div className="flex flex-col md:flex-row w-full max-w-[1000px] md:h-[586px] bg-white rounded-xl shadow-lg overflow-hidden p-3">

        {/* LEFT IMAGE */}
        <motion.div
          className="relative w-full md:w-1/2 h-48 md:h-auto p-3"
          variants={entryVariant}
          initial="hidden"
          animate="visible"
          custom={0} // no delay
        >
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
        </motion.div>

        {/* RIGHT FORM */}
        <motion.div
          className="w-full md:w-1/2 flex flex-col justify-center px-6 py-8 md:px-10"
          variants={entryVariant}
          initial="hidden"
          animate="visible"
          custom={0.2} // slight delay for form
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Signup</h2>

          <AnimatePresence>
            {errors.general && (
              <motion.p
                key="general-error"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="text-red-500 text-center mb-3"
              >
                {errors.general}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-5"
            variants={shakeVariants}
            animate={shake ? "shake" : "idle"}
          >
            {/* Username */}
            <div className="relative">
              <input
                id="username"
                value={formData.username}
                onChange={handleChange}
                placeholder=" "
                className={inputClass}
              />
              <label className={labelClass(formData.username)}>Username</label>
              <User className="absolute right-0 top-2 text-gray-500" size={18} />

              <AnimatePresence>
                {errors.username && (
                  <motion.p
                    key="username-error"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="text-red-500 text-sm mt-1"
                  >
                    {errors.username}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Email */}
            <div className="relative">
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder=" "
                className={inputClass}
              />
              <label className={labelClass(formData.email)}>Email</label>
              <Mail className="absolute right-0 top-2 text-gray-500" size={18} />

              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    key="email-error"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="text-red-500 text-sm mt-1"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Phone */}
            <div className="relative">
              <input
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder=" "
                className={inputClass}
              />
              <label className={labelClass(formData.phone)}>Phone Number</label>
              <Phone className="absolute right-0 top-2 text-gray-500" size={18} />

              <AnimatePresence>
                {errors.phone && (
                  <motion.p
                    key="phone-error"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="text-red-500 text-sm mt-1"
                  >
                    {errors.phone}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Password */}
            <div className="relative">
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder=" "
                className={inputClass}
              />
              <label className={labelClass(formData.password)}>Password</label>
              <Lock className="absolute right-0 top-2 text-gray-500" size={18} />

              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    key="password-error"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="text-red-500 text-sm mt-1"
                  >
                    {errors.password}
                  </motion.p>
                )}
              </AnimatePresence>
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
          </motion.form>

          <p className="mt-4 text-center">
            Already have an account?{" "}
            <Link href="/login" className="underline font-medium">
              Login
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
