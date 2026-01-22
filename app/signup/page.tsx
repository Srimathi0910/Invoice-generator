"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
  
  // --- Animation State ---
  const [animPhase, setAnimPhase] = useState("falling");

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimPhase("ready");
    }, 800); // Cube finishes in 0.8s
    return () => clearTimeout(timer);
  }, []);

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

  /* ---------------- ANIMATION VARIANTS ---------------- */

  const cubeVariants: Variants = {
    falling: { y: -800, rotateX: 0, rotateY: 0 },
    unfolding: {
      y: 0,
      rotateX: [0, 360],
      rotateY: [0, 360],
      transition: { duration: 0.8, ease: "backOut" },
    },
  };

  const entryVariant: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, type: "spring", damping: 15 },
    },
  };

  const shakeVariants: Variants = {
    idle: { x: 0 },
    shake: { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.5 } },
  };

  const inputClass = "peer w-full border-b border-gray-400 py-2 outline-none bg-transparent";
  const labelClass = (value: string) =>
    `absolute left-0 text-gray-500 transition-all duration-300 ${
      value ? "-top-3 text-sm text-black" : "top-2 text-base"
    }`;

  const faceSize = "200px";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#D9D9D9] p-4 overflow-hidden relative">
      
      {/* 1. THE 3D CUBE */}
      <AnimatePresence>
        {animPhase !== "ready" && (
          <motion.div
            key="cube-loader"
            variants={cubeVariants}
            initial="falling"
            animate="unfolding"
            exit={{ opacity: 0, scale: 1.2, transition: { duration: 0.2 } }}
            style={{
              width: faceSize,
              height: faceSize,
              transformStyle: "preserve-3d",
              perspective: "1000px",
            }}
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
            <div className="face front font-bold text-xl text-gray-700">SIGNUP</div>
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
            key="signup-form"
            variants={entryVariant}
            initial="hidden"
            animate="visible"
            className="flex flex-col md:flex-row w-full max-w-[1000px] md:h-[586px] bg-white rounded-xl shadow-lg overflow-hidden p-3 relative z-10"
          >
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
                <h1 className="text-white text-3xl md:text-4xl font-bold bg-white/20 px-10 py-6 backdrop-blur rounded-xl text-center">
                  Join Us <br /> Today
                </h1>
              </div>
            </div>

            {/* RIGHT FORM */}
            <div className="w-full md:w-1/2 flex flex-col justify-center px-6 py-8 md:px-10">
              <h2 className="text-2xl font-bold mb-6 text-center">Signup</h2>

              {errors.general && (
                <p className="text-red-500 text-center mb-3 text-sm">{errors.general}</p>
              )}

              <motion.form
                onSubmit={handleSubmit}
                className="space-y-5"
                variants={shakeVariants}
                animate={shake ? "shake" : "idle"}
              >
                {/* Username */}
                <div className="relative">
                  <input id="username" value={formData.username} onChange={handleChange} placeholder=" " className={inputClass} />
                  <label className={labelClass(formData.username)}>Username</label>
                  <User className="absolute right-0 top-2 text-gray-500" size={18} />
                  {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                </div>

                {/* Email */}
                <div className="relative">
                  <input id="email" type="email" value={formData.email} onChange={handleChange} placeholder=" " className={inputClass} />
                  <label className={labelClass(formData.email)}>Email</label>
                  <Mail className="absolute right-0 top-2 text-gray-500" size={18} />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div className="relative">
                  <input id="phone" value={formData.phone} onChange={handleChange} placeholder=" " className={inputClass} />
                  <label className={labelClass(formData.phone)}>Phone Number</label>
                  <Phone className="absolute right-0 top-2 text-gray-500" size={18} />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                {/* Password */}
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder=" "
                    className={inputClass}
                  />
                  <label className={labelClass(formData.password)}>Password</label>
                  <div className="absolute right-0 top-2 cursor-pointer text-gray-500" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`bg-[#D9D9D9] py-2 rounded-lg w-full md:w-3/4 mx-auto flex justify-center items-center text-lg mt-4 ${
                    loading ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-300 transition-colors"
                  }`}
                >
                  {loading ? "Signing Up..." : "Sign Up"}
                </button>
              </motion.form>

              <p className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="underline font-medium">Login</Link>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}