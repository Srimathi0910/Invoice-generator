"use client";

import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

export default function SignupSuccess() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#D9D9D9] p-4">
      <div className="bg-white rounded-xl shadow-lg p-10 flex flex-col items-center animate-fadeIn">

        <div className="mb-6 animate-scaleIn">
          <CheckCircle size={90} className="text-green-500" />
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Signup Successful!
        </h1>

        <p className="text-gray-600 text-center mb-6">
          Your account has been created successfully.
        </p>

        <button
          onClick={() => router.push("/login")}
          className="bg-[#D9D9D9] !text-black px-8 py-3 rounded-lg text-lg font-semibold hover:!bg-gray-800 transition cursor-pointer"
        >
          Go to Login
        </button>
      </div>

      <style jsx>{`
        .animate-scaleIn {
          animation: scaleIn 0.6s ease-out forwards;
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        @keyframes scaleIn {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
