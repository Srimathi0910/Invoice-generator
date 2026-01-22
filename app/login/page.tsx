"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Eye, EyeOff } from "lucide-react";
import { motion, Variants, AnimatePresence } from "framer-motion";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "", general: "" });
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Animation State: 'falling' -> 'ready'
  const [animPhase, setAnimPhase] = useState("falling");

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimPhase("ready");
    }, 1200); 
    return () => clearTimeout(timer);
  }, []);

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
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid email or password");
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      if (data.role === "company") router.replace("/dashboard");
      else if (data.role === "client") router.replace("/dashboard-client");
    } catch (err: any) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setErrors((prev) => ({ ...prev, general: err.message || "Invalid email or password" }));
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- ANIMATION VARIANTS ---------------- */

  const cubeVariants: Variants = {
    falling: {
      y: -500,
      rotateX: 0,
      rotateY: 0,
    },
    unfolding: {
      y: 0,
      rotateX: [0, 360, 720],
      rotateY: [0, 180, 360],
      transition: { duration: 1.0, ease: "easeOut" },
    },
  };

  const mainLayoutVariants: Variants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      transition: { type: "spring", damping: 15, stiffness: 100, delay: 0.1 } 
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  const inputClass = "peer w-full border-b border-gray-400 py-2 outline-none bg-transparent";
  const labelClass = (value: string) =>
    `absolute left-0 transition-all duration-300 ${
      value ? "-top-3 text-sm text-black" : "top-2 text-base text-gray-500"
    }`;

  const faceSize = "200px";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#D9D9D9] p-4 overflow-hidden relative">
      
      {/* 1. THE 3D CUBE - CENTERED USING ABSOLUTE */}
      <AnimatePresence>
        {animPhase !== "ready" && (
          <motion.div
            key="cube-loader"
            variants={cubeVariants}
            initial="falling"
            animate="unfolding"
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.3 } }}
            style={{
              width: faceSize,
              height: faceSize,
              transformStyle: "preserve-3d",
              perspective: "1000px",
            }}
            // FIXED: Added 'absolute' and 'm-auto' to ensure it stays in dead center
            className="absolute inset-0 m-auto z-50 pointer-events-none"
          >
            <style jsx>{`
              .face {
                position: absolute;
                width: 200px;
                height: 200px;
                background: white;
                border: 2px solid #ccc;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: inset 0 0 20px rgba(0,0,0,0.1);
                backface-visibility: visible;
              }
              .front  { transform: translateZ(100px); }
              .back   { transform: rotateY(180deg) translateZ(100px); }
              .right  { transform: rotateY(90deg) translateZ(100px); }
              .left   { transform: rotateY(-90deg) translateZ(100px); }
              .top    { transform: rotateX(90deg) translateZ(100px); }
              .bottom { transform: rotateX(-90deg) translateZ(100px); box-shadow: 0 50px 40px rgba(0,0,0,0.2); }
            `}</style>
            <div className="face front font-bold text-xl text-gray-700">LOGIN</div>
            <div className="face back" />
            <div className="face right bg-gray-50" />
            <div className="face left bg-gray-50" />
            <div className="face top bg-gray-100" />
            <div className="face bottom bg-gray-200" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. THE MAIN FORM */}
      <AnimatePresence>
        {animPhase === "ready" && (
          <motion.div
            key="login-form"
            variants={mainLayoutVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col md:flex-row w-full max-w-[900px] md:h-[586px] bg-white rounded-xl shadow-lg overflow-hidden p-3 relative z-10"
          >
            {/* LEFT FORM */}
            <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-8 md:px-10">
              <motion.div animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}>
                <div className="space-y-6 md:p-10">
                  <motion.h2 variants={itemVariants} className="text-2xl font-bold text-center">Login</motion.h2>
                  {errors.general && <p className="text-red-500 text-center text-sm">{errors.general}</p>}
                  <motion.form onSubmit={handleSubmit} className="space-y-6">
                    <motion.div variants={itemVariants} className="relative">
                      <input id="email" type="email" value={formData.email} onChange={handleChange} placeholder=" " className={inputClass} />
                      <label className={labelClass(formData.email)}>Email</label>
                      <Mail className="absolute right-0 top-2 text-gray-500" size={18} />
                    </motion.div>
                    <motion.div variants={itemVariants} className="relative">
                      <input id="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} placeholder=" " className={inputClass} />
                      <label className={labelClass(formData.password)}>Password</label>
                      <div className="absolute right-0 top-2 cursor-pointer text-gray-500" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                      </div>
                    </motion.div>
                    <button type="submit" disabled={loading} className="bg-[#D9D9D9] py-2 rounded-lg w-full md:w-3/4 mx-auto block hover:bg-gray-300">
                      {loading ? "Logging in..." : "Login"}
                    </button>
                    <p className="text-center text-sm"><Link href="/forgot-password-email" className="underline">Forgot Password?</Link></p>
                    <p className="text-center text-sm">Don&apos;t have an account? <Link href="/signup" className="underline font-medium">Signup</Link></p>
                  </motion.form>
                </div>
              </motion.div>
            </div>
            {/* RIGHT IMAGE */}
            <div className="relative w-full md:w-1/2 h-48 md:h-auto p-3">
              <Image src="/assets/login/login-img.png" alt="Login" fill className="object-cover rounded-xl" priority />
              <div className="absolute inset-0 flex items-center justify-center">
                <h1 className="text-white text-3xl md:text-4xl font-bold bg-white/20 px-10 py-6 backdrop-blur rounded-xl text-center">
                  Welcome <br /> Back
                </h1>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}