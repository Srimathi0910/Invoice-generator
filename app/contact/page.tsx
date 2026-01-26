"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";
import { useState, useEffect } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // --- Animation State ---
  const [animPhase, setAnimPhase] = useState("falling");

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimPhase("ready");
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const [popup, setPopup] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    type: "info",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !message) {
      setPopup({
        open: true,
        message: "All fields are required",
        type: "error",
      });
      return;
    }

    try {
      const res = await fetch("/api/auth/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();

      if (data.success) {
        setPopup({
          open: true,
          message: "Message sent successfully!",
          type: "success",
        });

        setName("");
        setEmail("");
        setMessage("");
      } else {
        setPopup({
          open: true,
          message: data.message || "Failed to send message",
          type: "error",
        });
      }
    } catch (error) {
      setPopup({
        open: true,
        message: "Something went wrong. Try again later.",
        type: "error",
      });
    }
  };

  /* ---------------- BOX ANIMATION VARIANTS ---------------- */
  const cubeVariants: Variants = {
    falling: { y: -800, rotateX: 0, rotateY: 0 },
    unfolding: {
      y: 0,
      rotateX: [0, 360],
      rotateY: [0, 360],
      transition: { duration: 0.8, ease: "backOut" },
    },
  };

  const mainContentVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  const faceSize = "200px";

  return (
    <div className="min-h-screen bg-gray-200 p-4 md:p-6">
      {/* 1. THE 3D CUBE LOADER */}
      <AnimatePresence>
        {animPhase !== "ready" && (
          <motion.div
            key="cube-loader"
            variants={cubeVariants}
            initial="falling"
            animate="unfolding"
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
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
                font-weight: bold;
                font-size: 1.2rem;
                color: #333;
                box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.1);
                backface-visibility: visible;
              }
              .front {
                transform: translateZ(100px);
              }
              .back {
                transform: rotateY(180deg) translateZ(100px);
              }
              .right {
                transform: rotateY(90deg) translateZ(100px);
              }
              .left {
                transform: rotateY(-90deg) translateZ(100px);
              }
              .top {
                transform: rotateX(90deg) translateZ(100px);
              }
              .bottom {
                transform: rotateX(-90deg) translateZ(100px);
                box-shadow: 0 50px 40px rgba(0, 0, 0, 0.2);
              }
            `}</style>
            <div className="face front">CONTACT US</div>
            <div className="face back">US</div>
            <div className="face right bg-gray-50" />
            <div className="face left bg-gray-50" />
            <div className="face top bg-gray-100" />
            <div className="face bottom bg-gray-200" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. THE MAIN CONTENT */}
      <AnimatePresence>
        {animPhase === "ready" && (
          <motion.div
            key="contact-content"
            variants={mainContentVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Heading */}
            <div className="text-center m-15">
              <h1 className="text-3xl font-bold text-black">Contact Us</h1>
              <p className="text-black mt-2">
                We’d love to hear from you. Please reach out with any questions.
              </p>
            </div>

            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="border border-white bg-white/20 rounded-2xl p-6 space-y-6 text-black"
              >
                <h2 className="text-xl font-semibold text-black">
                  Get in Touch
                </h2>
                <div className="flex items-start gap-4">
                  <FaEnvelope className="text-xl text-black mt-1" />
                  <div>
                    <p className="font-medium text-black">Email</p>
                    <p className="text-black">support@invoicegenerator.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <FaPhoneAlt className="text-xl text-black mt-1" />
                  <div>
                    <p className="font-medium text-black">Phone</p>
                    <p className="text-black">+91 98765 43210</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <FaMapMarkerAlt className="text-xl text-black mt-1" />
                  <div>
                    <p className="font-medium text-black">Address</p>
                    <p className="text-black">
                      Invoice Generator Pvt Ltd
                      <br />
                      Tamil Nadu, India
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Contact Form */}
              <motion.form
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="border border-white bg-white/20 rounded-2xl p-6 space-y-4 border border-white bg-white/20"
                onSubmit={handleSubmit}
              >
                <h2 className="text-xl font-semibold text-black mb-2">
                  Send a Message
                </h2>

                <input
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/20 backdrop-blur-md border px-4 py-2 text-black placeholder-black/70  border border-white bg-white/20 px-3 py-2 w-full mb-3"
                />

                <input
                  type="email"
                  placeholder="Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/20 backdrop-blur-md border px-4 py-2 text-black placeholder-black/70  border border-white bg-white/20 px-3 py-2 w-full mb-3"
                />

                <textarea
                  placeholder="Your Message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-white/20 backdrop-blur-md border px-4 py-2 text-black placeholder-black/70  border border-white bg-white/20 px-3 py-2 w-full mb-3"
                />

                <button
                  type="submit"
                  className="w-full bg-white/30 backdrop-blur-md text-black py-2 rounded-xl border border-white/30 hover:bg-white/40 transition"
                >
                  Send Message
                </button>
              </motion.form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popup stays outside the animPhase logic to ensure it can show anytime */}
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
