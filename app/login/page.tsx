"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { authFetch } from "@/utils/authFetch";

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
  const [shake, setShake] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // ✅ Toggle password

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
      credentials: "include", // ✅ IMPORTANT for cookies
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Invalid email or password");
    }

    // ✅ Successful login
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.token);

    if (data.role === "company") router.replace("/dashboard");
    else if (data.role === "client") router.replace("/dashboard-client");

  } catch (err: any) {
    setShake(true);
    setTimeout(() => setShake(false), 500);

    setErrors({
      email: "",
      password: "",
      general: err.message || "Invalid email or password",
    });
  } finally {
    setLoading(false);
  }
};


  /* ---------------- ANIMATIONS ---------------- */
  const pageVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const formPanelVariants: Variants = {
    hidden: { y: -80, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: -30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const imageVariants: Variants = {
    hidden: { y: -120, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const shakeVariants: Variants = {
    idle: { x: 0 },
    shake: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.5 },
    },
  };

  const inputClass =
    "peer w-full border-b border-gray-400 py-2 outline-none bg-transparent";

  const labelClass = (value: string) =>
    `absolute left-0 transition-all duration-300 ${
      value ? "-top-3 text-sm text-black" : "top-2 text-base text-gray-500"
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#D9D9D9] p-4">
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col md:flex-row w-full max-w-[900px] md:h-[586px] bg-white rounded-xl shadow-lg overflow-hidden p-3"
      >
        {/* LEFT FORM (TOP → BOTTOM) */}
        <motion.div
          variants={formPanelVariants}
          initial="hidden"
          animate="visible"
          className="w-full md:w-1/2 flex flex-col justify-center px-6 py-8 md:px-10"
        >
          <motion.div
            variants={shakeVariants}
            animate={shake ? "shake" : "idle"}
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6 md:p-10"
            >
              <motion.h2
                variants={itemVariants}
                className="text-2xl font-bold text-center"
              >
                Login
              </motion.h2>

              <AnimatePresence>
                {errors.general && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="text-red-500 text-center"
                  >
                    {errors.general}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.form
                onSubmit={handleSubmit}
                variants={containerVariants}
                className="space-y-6"
              >
                {/* Email */}
                <motion.div variants={itemVariants} className="relative">
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder=" "
                    className={inputClass}
                  />
                  <label className={labelClass(formData.email)}>Email</label>
                  <Mail
                    className="absolute right-0 top-2 text-gray-500"
                    size={18}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </motion.div>

                {/* Password with show/hide */}
                <motion.div variants={itemVariants} className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder=" "
                    className={inputClass}
                  />
                  <label className={labelClass(formData.password)}>
                    Password
                  </label>

                  {/* Toggle Eye Icon */}
                  <div
                    className="absolute right-0 top-2 cursor-pointer text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </div>

                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </motion.div>

                <motion.button
                  variants={itemVariants}
                  type="submit"
                  disabled={loading}
                  className="bg-[#D9D9D9] py-2 rounded-lg w-full md:w-3/4 mx-auto block hover:bg-gray-300"
                >
                  {loading ? "Logging in..." : "Login"}
                </motion.button>

                <motion.p variants={itemVariants} className="text-center">
                  <Link href="/forgot-password-email" className="underline">
                    Forgot Password?
                  </Link>
                </motion.p>

                <motion.p variants={itemVariants} className="text-center">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="underline font-medium">
                    Signup
                  </Link>
                </motion.p>
              </motion.form>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* RIGHT IMAGE (TOP → BOTTOM) */}
        <motion.div
          variants={imageVariants}
          initial="hidden"
          animate="visible"
          className="relative w-full md:w-1/2 h-48 md:h-auto p-3"
        >
          <Image
            src="/assets/login/login-img.png"
            alt="Login"
            fill
            className="object-cover rounded-xl"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-white text-3xl md:text-4xl font-bold bg-white/20 px-10 py-6 backdrop-blur rounded-xl">
              Welcome <br /> Back
            </h1>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
