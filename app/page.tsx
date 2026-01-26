"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import "./_components/animations/animations.css";

export default function WelcomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true); // track redirect check
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!pathname) return; // wait for pathname

    const storedUser = localStorage.getItem("user");

    // ✅ Redirect logged-in users to dashboard
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser?._id) {
        router.replace("/dashboard");
        return;
      }
    }

    // ✅ Show content for non-logged-in users
    setLoading(false);
  }, [router, pathname]);

  // Show nothing while checking redirect
  if (loading) return null;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <Image
        src="/assets/welcome/welcome-img.png"
        alt="Background"
        fill
        className="object-cover bg-slide delay-0"
        priority
      />

      {/* Overlay */}
      <div className="absolute inset-0" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* TOP NAVBAR */}
        <div className="flex flex-wrap md:flex-nowrap justify-between items-center px-4 sm:px-6 md:px-10 py-4 md:py-6 stagger-item delay-2000">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10"></div>
          </div>

          {/* Login / Signup */}
          <div className="flex gap-2 sm:gap-4 mt-2 md:mt-0">
            <Link href="/login">
              <button className="bg-[#D9D9D9] text-black px-4 sm:px-5 py-2 rounded-lg hover:bg-white transition shadow-[10px_10px_10px_rgba(0,0,0,0.25)] text-sm sm:text-base slide-down delay-2000">
                Login
              </button>
            </Link>

            <Link href="/signup">
              <button className="bg-[#D9D9D9] text-black px-4 sm:px-5 py-2 rounded-lg hover:bg-white transition shadow-[10px_10px_10px_rgba(0,0,0,0.25)] text-sm sm:text-base slide-down delay-2200">
                Signup
              </button>
            </Link>
          </div>
        </div>

        {/* MAIN SECTION */}
        <div className="flex flex-col md:flex-row flex-1 items-center px-4 sm:px-6 md:px-10 py-6 md:py-0">
          <div className="w-full md:w-auto max-w-full md:max-w-xl text-black text-center md:text-left">
            <h1 className="text-[32px] sm:text-[40px] md:text-[50px] mb-4 slide-left delay-1000">
              WELCOME TO <br /> INVOICE GENERATOR
            </h1>

            <p className="text-[18px] sm:text-[20px] md:text-[24px] leading-[22px] sm:leading-[24px] md:leading-[28px] mb-8 mt-6 slide-left delay-1200">
              Easily create, manage, and track your
              <br /> invoices in minutes. Simplify your billing
              <br /> process and stay organized.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link href="/signup">
                <button className="bg-[#D9D9D9] text-black px-4 sm:px-6 rounded-lg w-full sm:w-[220px] h-[50px] text-[20px] sm:text-[24px] flex items-center justify-center hover:bg-gray-300 transition shadow-[10px_10px_10px_rgba(0,0,0,0.25)] stagger-item delay-2000">
                  Get Started
                </button>
              </Link>
              <Link href="/contact">
                <button className="bg-white text-black px-4 sm:px-6 rounded-lg w-full sm:w-[220px] h-[50px] text-[20px] sm:text-[24px] flex items-center justify-center hover:bg-gray-100 transition shadow-[10px_10px_10px_rgba(0,0,0,0.25)] stagger-item delay-2000">
                  Contact Us
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
