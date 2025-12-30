"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Edit2, Download, Send } from "lucide-react"; // example icons


const InvoicePreview = () => {
  const searchParams = useSearchParams();
  const [invoice, setInvoice] = useState<any>(null);

  useEffect(() => {
    const data = searchParams.get("data");
    if (data) setInvoice(JSON.parse(data));
  }, [searchParams]);

  if (!invoice) return <div>Loading...</div>;

  const saveInvoice = async () => {
    try {
      const res = await fetch("/api/auth/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoice),
      });
      const data = await res.json();
      if (data.success) alert("Invoice Saved! ID: " + data.invoiceId);
      else alert("Error saving invoice");
    } catch (err) {
      console.error(err);
      alert("Network error. Invoice not saved.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Invoice Preview</h1>

        {/* Header */}
        <div className="flex justify-between mb-6">
          {/* Billed By */}
          <div>
            <h2 className="font-bold">{invoice.billedBy.businessName || "Your Business"}</h2>
            <p>{invoice.billedBy.address}, {invoice.billedBy.city}</p>
            <p>{invoice.billedBy.country}</p>
            <p>Phone: {invoice.billedBy.phone}</p>
            <p>GSTIN: {invoice.billedBy.gstin}</p>
          </div>

          {/* Invoice Meta */}
          <div className="text-right">
            <p>Invoice #: {invoice.invoiceMeta.invoiceNumber}</p>
            <p>Date: {invoice.invoiceMeta.invoiceDate}</p>
            <p>Due: {invoice.invoiceMeta.dueDate}</p>
          </div>
        </div>

        {/* Billed To */}
        <div className="mb-6">
          <h3 className="font-semibold">Billed To (Client)</h3>
          <p>{invoice.billedTo.businessName || "Client Name"}</p>
          <p>{invoice.billedTo.address}, {invoice.billedTo.city}</p>
          <p>{invoice.billedTo.country}</p>
          <p>Phone: {invoice.billedTo.phone}</p>
          <p>GSTIN: {invoice.billedTo.gstin}</p>
        </div>

        {/* Items Table */}
        <table className="w-full border text-sm mb-4">
          <thead className="bg-gray-200">
            <tr>
              <th className="border px-2">Item</th>
              <th className="border px-2">HSN</th>
              <th className="border px-2">GST%</th>
              <th className="border px-2">Qty</th>
              <th className="border px-2">Rate</th>
              <th className="border px-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item: any, i: number) => {
              const amount = item.qty * item.rate;
              return (
                <tr key={i} className="text-center">
                  <td className="border px-2">{item.itemName}</td>
                  <td className="border px-2">{item.hsn}</td>
                  <td className="border px-2">{item.gst}%</td>
                  <td className="border px-2">{item.qty}</td>
                  <td className="border px-2">₹{item.rate.toFixed(2)}</td>
                  <td className="border px-2">₹{amount.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end text-right mb-4">
          <div className="w-1/3 space-y-1">
            <p>Amount: ₹{invoice.totals.amount.toFixed(2)}</p>
            <p>CGST: ₹{invoice.totals.cgst.toFixed(2)}</p>
            <p>SGST: ₹{invoice.totals.sgst.toFixed(2)}</p>
            <p className="font-semibold">Discount: ₹{invoice.extras.discount || 0}</p>
            <p className="font-semibold">Additional Charges: ₹{invoice.extras.charges || 0}</p>
            <p className="font-bold text-lg">Grand Total: ₹{invoice.totals.grandTotal.toFixed(2)}</p>
            <p className="italic">Total in words: {invoice.totalInWords}</p>
          </div>
        </div>

        {/* Save Button */}
        {/* Save Button Centered */}
        <div className="flex justify-center p-10 m-6">
          <button
            className="bg-[#D9D9D9] text-black px-6 py-2 rounded flex items-center gap-2 hover:bg-gray-300"
            onClick={saveInvoice}
          >
            Save Invoice
          </button>
        </div>

        <div className="flex justify-center gap-4">
          <button
            className="bg-[#D9D9D9] text-black px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-300"
            onClick={saveInvoice}
          >
            <Edit2 size={16} /> Edit Invoice
          </button>

          <button
            className="bg-[#D9D9D9] text-black px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-300"
            onClick={saveInvoice}
          >
            <Download size={16} /> Download PDF
          </button>

          <button
            className="bg-[#D9D9D9] text-black px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-300"
            onClick={saveInvoice}
          >
            <Send size={16} /> Send Invoice
          </button>
        </div>

      </div>



    </div>
  );
};

export default InvoicePreview;
