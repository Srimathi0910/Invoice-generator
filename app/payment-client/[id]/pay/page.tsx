"use client";

import { useParams, useSearchParams } from "next/navigation";

export default function PayInvoicePage() {
  const { id } = useParams();               // invoice id
  const searchParams = useSearchParams();
  const method = searchParams.get("method"); // UPI / CARD / NETBANKING

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Pay Invoice</h1>

      <p><b>Invoice ID:</b> {id}</p>
      <p><b>Payment Method:</b> {method}</p>

      <button className="mt-6 px-6 py-2 bg-green-600 text-white rounded">
        Proceed to Pay
      </button>
    </div>
  );
}
