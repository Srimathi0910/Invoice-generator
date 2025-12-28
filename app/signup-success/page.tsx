"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function SignupSuccess() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message") || "Signup successful!";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#D9D9D9]">
      <div className="bg-white p-10 rounded-xl shadow-lg text-center">
        <h1 className="text-3xl font-bold mb-4 text-green-600">{message}</h1>
        <p className="mb-6">You can now login to your account.</p>
        <Link
          href="/login"
          className="bg-[#D9D9D9] text-black px-6 py-2 rounded-lg hover:bg-gray-300 transition"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}
