"use client";

import { useState } from "react";
import {
  X,
  Eye,
  FileText,
  StickyNote,
  Paperclip,
  Info,
  Phone,
} from "lucide-react";
import Link from "next/link";
type Item = {
  itemName: string;
  hsn: string;
  gst: number;
  qty: number;
  rate: number;
};

export default function InvoicePage() {
  /* ---------------- Invoice Meta ---------------- */
  const [invoiceMeta, setInvoiceMeta] = useState({
    invoiceNumber: "",
    invoiceDate: "",
    dueDate: "",
  });

  /* ---------------- Items ---------------- */
  const [items, setItems] = useState<Item[]>([
    { itemName: "", hsn: "", gst: 0, qty: 1, rate: 0 },
  ]);

  /* ---------------- Extras ---------------- */
  const [extras, setExtras] = useState({
    discount: 0,
    charges: 0,
    round: 0,
  });

  /* ---------------- Totals ---------------- */
  const [totals, setTotals] = useState({
    amount: 0,
    cgst: 0,
    sgst: 0,
    grandTotal: 0,
    totalQty: 0,
  });

  /* ---------------- Item handlers ---------------- */
  const addItem = () =>
    setItems([...items, { itemName: "", hsn: "", gst: 0, qty: 1, rate: 0 }]);

  const removeItem = (index: number) =>
    setItems(items.filter((_, i) => i !== index));

  const handleChange = (index: number, field: keyof Item, value: string) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: field === "itemName" || field === "hsn" ? value : Number(value),
    };
    setItems(updated);
  };

  /* ---------------- Calculation ---------------- */
  const calculateTotal = (e: React.FormEvent) => {
    e.preventDefault();

    let amount = 0;
    let cgst = 0;
    let sgst = 0;
    let qty = 0;

    items.forEach((item) => {
      const rowAmount = item.qty * item.rate;
      const gstHalf = item.gst / 2;

      amount += rowAmount;
      cgst += (rowAmount * gstHalf) / 100;
      sgst += (rowAmount * gstHalf) / 100;
      qty += item.qty;
    });

    const grand =
      amount + cgst + sgst - extras.discount + extras.charges + extras.round;

    setTotals({
      amount,
      cgst,
      sgst,
      totalQty: qty,
      grandTotal: grand,
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <form
        onSubmit={calculateTotal}
        className="max-w-7xl mx-auto bg-white rounded-xl shadow p-6"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold">Invoice</h1>
          <button
            type="button"
            className="border border-dashed px-4 py-2 rounded"
          >
            Add Business Logo
          </button>
        </div>

        {/* INVOICE META */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <input
            className="input"
            placeholder="Invoice Number"
            required
            value={invoiceMeta.invoiceNumber}
            onChange={(e) =>
              setInvoiceMeta({
                ...invoiceMeta,
                invoiceNumber: e.target.value,
              })
            }
          />
          <input
            className="input"
            type="date"
            required
            value={invoiceMeta.invoiceDate}
            onChange={(e) =>
              setInvoiceMeta({
                ...invoiceMeta,
                invoiceDate: e.target.value,
              })
            }
          />
          <input
            className="input"
            type="date"
            required
            value={invoiceMeta.dueDate}
            onChange={(e) =>
              setInvoiceMeta({
                ...invoiceMeta,
                dueDate: e.target.value,
              })
            }
          />
        </div>

        {/* BILLED DETAILS (NOT REMOVED) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="bg-gray-50 p-5 rounded-lg">
            <h3 className="font-semibold mb-4">Billed By (Your Details)</h3>
            <div className="grid gap-3">
              <input className="input" placeholder="Country" required />
              <input
                className="input"
                placeholder="Your Business Name"
                required
              />
              <input className="input" placeholder="Phone No" required />
              <input className="input" placeholder="Your GSTIN" required />
              <input className="input" placeholder="Address" required />
              <input className="input" placeholder="City" required />
            </div>
          </div>

          <div className="bg-gray-50 p-5 rounded-lg">
            <h3 className="font-semibold mb-4">Billed By (Client’s Details)</h3>
            <div className="grid gap-3">
              <input className="input" placeholder="Country" required />
              <input
                className="input"
                placeholder="Client Business Name"
                required
              />
              <input className="input" placeholder="Phone No" required />
              <input className="input" placeholder="GSTIN" required />
              <input className="input" placeholder="Address" required />
              <input className="input" placeholder="City" required />
            </div>
          </div>
        </div>

        {/* ITEMS + SUMMARY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* ITEMS TABLE */}
          <div className="lg:col-span-2 overflow-x-auto">
            <table className="w-full border text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="th">Item</th>
                  <th className="th">HSN</th>
                  <th className="th">GST%</th>
                  <th className="th">Qty</th>
                  <th className="th">Rate</th>
                  <th className="th">Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => {
                  const amount = item.qty * item.rate;
                  return (
                    <tr key={i}>
                      <td className="td">
                        <input
                          className="input-sm"
                          required
                          onChange={(e) =>
                            handleChange(i, "itemName", e.target.value)
                          }
                        />
                      </td>
                      <td className="td">
                        <input
                          className="input-sm"
                          required
                          onChange={(e) =>
                            handleChange(i, "hsn", e.target.value)
                          }
                        />
                      </td>
                      <td className="td">
                        <input
                          className="input-sm"
                          type="number"
                          required
                          onChange={(e) =>
                            handleChange(i, "gst", e.target.value)
                          }
                        />
                      </td>
                      <td className="td">
                        <input
                          className="input-sm"
                          type="number"
                          value={item.qty}
                          required
                          onChange={(e) =>
                            handleChange(i, "qty", e.target.value)
                          }
                        />
                      </td>
                      <td className="td">
                        <input
                          className="input-sm"
                          type="number"
                          required
                          onChange={(e) =>
                            handleChange(i, "rate", e.target.value)
                          }
                        />
                      </td>
                      <td className="td">₹{amount.toFixed(2)}</td>
                      <td className="td">
                        <X
                          size={16}
                          className="text-red-600 cursor-pointer"
                          onClick={() => removeItem(i)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <button
              type="button"
              onClick={addItem}
              className="w-full mt-3 bg-gray-200 py-2 rounded"
            >
              + Add New Item
            </button>
          </div>

          {/* RIGHT SUMMARY */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center font-semibold">
              <span>Show Total (PDF)</span>
              <Eye />
            </div>

            <div className="flex justify-between">
              <span>Amount</span>
              <span>₹{totals.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>SGST</span>
              <span>₹{totals.sgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>CGST</span>
              <span>₹{totals.cgst.toFixed(2)}</span>
            </div>

            <input
              className="input-sm"
              placeholder="Add Discounts"
              type="number"
              onChange={(e) =>
                setExtras({ ...extras, discount: Number(e.target.value) })
              }
            />
            <input
              className="input-sm"
              placeholder="Add Additional Charges"
              type="number"
              onChange={(e) =>
                setExtras({ ...extras, charges: Number(e.target.value) })
              }
            />

            <div className="flex gap-2">
              <button
                type="button"
                className="btn-sm"
                onClick={() => setExtras({ ...extras, round: 1 })}
              >
                Round Up
              </button>
              <button
                type="button"
                className="btn-sm"
                onClick={() => setExtras({ ...extras, round: -1 })}
              >
                Round Down
              </button>
            </div>

            <hr />

            <div className="flex justify-between font-semibold">
              <span>Total Qty</span>
              <span>{totals.totalQty}</span>
            </div>

            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>₹{totals.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* TOTAL IN WORDS */}
        <div className="mb-6">
          <p className="font-medium">Total (in words)</p>
          <p className="text-sm">one rupee and eighteen paise only</p>
        </div>

        {/* EXTRA INPUTS */}
        <div className="mb-6">
          {/* Add Signature */}
          <div className="mb-4 flex justify-end">
            <label className="flex items-center justify-center gap-3 px-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 w-64 h-10">
              <FileText size={18} className="text-gray-500" />
              <span className="text-sm text-gray-600 text-center">
                Upload Signature (PNG / JPG)
              </span>
              <input type="file" accept=".png,.jpg,.jpeg" className="hidden" />
            </label>
          </div>

          {/* FILE UPLOAD GRID */}
          <div className="grid md:grid-cols-3 gap-4 justify-items-center">
            {/* Terms & Conditions */}
            <label className="flex items-center justify-center gap-3 px-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 w-64 h-10">
              <FileText size={18} className="text-gray-500" />
              <span className="text-sm text-gray-600 text-center">
                Add Terms & Conditions
              </span>
              <input type="file" accept=".pdf,.doc,.docx" className="hidden" />
            </label>

            {/* Notes */}
            <label className="flex items-center justify-center gap-3 px-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 w-64 h-10">
              <StickyNote size={18} className="text-gray-500" />
              <span className="text-sm text-gray-600 text-center">
                Add Notes
              </span>
              <input
                type="file"
                accept=".txt,.pdf,.doc,.docx"
                className="hidden"
              />
            </label>

            {/* Attachments */}
            <label className="flex items-center justify-center gap-3 px-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 w-64 h-10">
              <Paperclip size={18} className="text-gray-500" />
              <span className="text-sm text-gray-600 text-center">
                Add Attachments
              </span>
              <input type="file" multiple className="hidden" />
            </label>
          </div>

          {/* Last 2 uploads */}
          <div className="grid md:grid-cols-2 gap-4 justify-items-center mt-4">
            {/* Additional Info */}
            <label className="flex items-center justify-center gap-3 px-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 w-64 h-10">
              <Info size={18} className="text-gray-500" />
              <span className="text-sm text-gray-600 text-center">
                Additional Information
              </span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.png"
                className="hidden"
              />
            </label>

            {/* Contact Details */}
            <label className="flex items-center justify-center gap-3 px-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 w-64 h-10">
              <Phone size={18} className="text-gray-500" />
              <span className="text-sm text-gray-600 text-center">
                Contact Details
              </span>
              <input type="file" accept=".pdf,.vcf" className="hidden" />
            </label>
          </div>
        </div>

        {/* ACTION */}
        <div className="text-center">
          <button
            type="submit"
            className="bg-[#D9D9D9] text-black px-6 py-3 rounded-lg cursor-pointer"
          >
            Calculate Total
          </button>
          <p className="mt-4 text-center text-[16px] md:text-[20px]">
            <Link href="/preview" className="underline">
              Preview
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
