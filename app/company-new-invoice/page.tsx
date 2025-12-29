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
<<<<<<< HEAD
=======
import { useRouter } from "next/navigation";

>>>>>>> d69b7d5 (Initial commit)
type Item = {
  itemName: string;
  hsn: string;
  gst: number;
  qty: number;
  rate: number;
};

export default function InvoicePage() {
<<<<<<< HEAD
=======
  const router = useRouter();

>>>>>>> d69b7d5 (Initial commit)
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

<<<<<<< HEAD
=======
  /* ---------------- Business Details ---------------- */
  const [billedBy, setBilledBy] = useState({
    country: "",
    businessName: "",
    phone: "",
    gstin: "",
    address: "",
    city: "",
  });

  const [billedTo, setBilledTo] = useState({
    country: "",
    businessName: "",
    phone: "",
    gstin: "",
    address: "",
    city: "",
  });

>>>>>>> d69b7d5 (Initial commit)
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

<<<<<<< HEAD
  /* ---------------- Calculation ---------------- */
  const calculateTotal = (e: React.FormEvent) => {
    e.preventDefault();
=======
  /* ---------------- Total Calculation ---------------- */
  const calculateTotal = (e?: React.FormEvent) => {
    e?.preventDefault();
>>>>>>> d69b7d5 (Initial commit)

    let amount = 0;
    let cgst = 0;
    let sgst = 0;
    let qty = 0;

    items.forEach((item) => {
      const rowAmount = item.qty * item.rate;
      const gstHalf = item.gst / 2;
<<<<<<< HEAD

=======
>>>>>>> d69b7d5 (Initial commit)
      amount += rowAmount;
      cgst += (rowAmount * gstHalf) / 100;
      sgst += (rowAmount * gstHalf) / 100;
      qty += item.qty;
    });

<<<<<<< HEAD
    const grand =
      amount + cgst + sgst - extras.discount + extras.charges + extras.round;

    setTotals({
      amount,
      cgst,
      sgst,
      totalQty: qty,
      grandTotal: grand,
    });
=======
    let grand = amount + cgst + sgst - extras.discount + extras.charges;
    if (extras.round === 1) grand = Math.ceil(grand);
    else if (extras.round === -1) grand = Math.floor(grand);

    setTotals({ amount, cgst, sgst, totalQty: qty, grandTotal: grand });
  };

  /* ---------------- Convert Total to Words ---------------- */
  const numberToWords = (num: number) => {
    // simple implementation for demo
    return `${num} rupees only`;
  };

  /* ---------------- Save Invoice ---------------- */
  const handleSaveInvoice = async (e?: React.FormEvent) => {
    e?.preventDefault();
    calculateTotal();

    const storedUser = localStorage.getItem("user");
    if (!storedUser) return alert("Please login to save invoice");
    const user = JSON.parse(storedUser);

    const invoiceData = {
      invoiceMeta,
      billedBy,
      billedTo,
      items,
      extras,
      totals,
      totalInWords: numberToWords(totals.grandTotal),
      uploadedFiles: {}, // handle files later
      userEmail: user.email,
      userName: user.name,
    };

    try {
      const res = await fetch("/api/auth/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      });
      const data = await res.json();
      if (data.success) alert("Invoice saved! ID: " + data.invoiceId);
      else alert("Error saving invoice: " + data.error);
    } catch (err) {
      console.error(err);
      alert("Network error. Invoice not saved.");
    }
  };

  /* ---------------- Preview ---------------- */
  const handlePreview = () => {
    calculateTotal();
    const dataStr = encodeURIComponent(
      JSON.stringify({ invoiceMeta, billedBy, billedTo, items, extras, totals, totalInWords: numberToWords(totals.grandTotal) })
    );
    router.push(`/preview?data=${dataStr}`);
>>>>>>> d69b7d5 (Initial commit)
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
<<<<<<< HEAD
      <form
        onSubmit={calculateTotal}
        className="max-w-7xl mx-auto bg-white rounded-xl shadow p-6"
      >
=======
      <form className="max-w-7xl mx-auto bg-white rounded-xl shadow p-6">
>>>>>>> d69b7d5 (Initial commit)
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
<<<<<<< HEAD
            required
            value={invoiceMeta.invoiceNumber}
            onChange={(e) =>
              setInvoiceMeta({
                ...invoiceMeta,
                invoiceNumber: e.target.value,
              })
=======
            value={invoiceMeta.invoiceNumber}
            onChange={(e) =>
              setInvoiceMeta({ ...invoiceMeta, invoiceNumber: e.target.value })
>>>>>>> d69b7d5 (Initial commit)
            }
          />
          <input
            className="input"
            type="date"
<<<<<<< HEAD
            required
            value={invoiceMeta.invoiceDate}
            onChange={(e) =>
              setInvoiceMeta({
                ...invoiceMeta,
                invoiceDate: e.target.value,
              })
=======
            value={invoiceMeta.invoiceDate}
            onChange={(e) =>
              setInvoiceMeta({ ...invoiceMeta, invoiceDate: e.target.value })
>>>>>>> d69b7d5 (Initial commit)
            }
          />
          <input
            className="input"
            type="date"
<<<<<<< HEAD
            required
            value={invoiceMeta.dueDate}
            onChange={(e) =>
              setInvoiceMeta({
                ...invoiceMeta,
                dueDate: e.target.value,
              })
=======
            value={invoiceMeta.dueDate}
            onChange={(e) =>
              setInvoiceMeta({ ...invoiceMeta, dueDate: e.target.value })
>>>>>>> d69b7d5 (Initial commit)
            }
          />
        </div>

<<<<<<< HEAD
        {/* BILLED DETAILS (NOT REMOVED) */}
=======
        {/* BILLED DETAILS */}
>>>>>>> d69b7d5 (Initial commit)
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="bg-gray-50 p-5 rounded-lg">
            <h3 className="font-semibold mb-4">Billed By (Your Details)</h3>
            <div className="grid gap-3">
<<<<<<< HEAD
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
=======
              {Object.keys(billedBy).map((key) => (
                <input
                  key={key}
                  className="input"
                  placeholder={key}
                  value={(billedBy as any)[key]}
                  onChange={(e) =>
                    setBilledBy({ ...billedBy, [key]: e.target.value })
                  }
                />
              ))}
>>>>>>> d69b7d5 (Initial commit)
            </div>
          </div>

          <div className="bg-gray-50 p-5 rounded-lg">
<<<<<<< HEAD
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
=======
            <h3 className="font-semibold mb-4">Billed To (Client’s Details)</h3>
            <div className="grid gap-3">
              {Object.keys(billedTo).map((key) => (
                <input
                  key={key}
                  className="input"
                  placeholder={key}
                  value={(billedTo as any)[key]}
                  onChange={(e) =>
                    setBilledTo({ ...billedTo, [key]: e.target.value })
                  }
                />
              ))}
>>>>>>> d69b7d5 (Initial commit)
            </div>
          </div>
        </div>

<<<<<<< HEAD
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
=======
        {/* ITEMS TABLE */}
        <div className="lg:col-span-2 overflow-x-auto mb-6">
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
              {items.map((item, i) => (
                <tr key={i}>
                  <td className="td">
                    <input
                      className="input-sm"
                      value={item.itemName}
                      onChange={(e) => handleChange(i, "itemName", e.target.value)}
                    />
                  </td>
                  <td className="td">
                    <input
                      className="input-sm"
                      value={item.hsn}
                      onChange={(e) => handleChange(i, "hsn", e.target.value)}
                    />
                  </td>
                  <td className="td">
                    <input
                      className="input-sm"
                      type="number"
                      value={item.gst}
                      onChange={(e) => handleChange(i, "gst", e.target.value)}
                    />
                  </td>
                  <td className="td">
                    <input
                      className="input-sm"
                      type="number"
                      value={item.qty}
                      onChange={(e) => handleChange(i, "qty", e.target.value)}
                    />
                  </td>
                  <td className="td">
                    <input
                      className="input-sm"
                      type="number"
                      value={item.rate}
                      onChange={(e) => handleChange(i, "rate", e.target.value)}
                    />
                  </td>
                  <td className="td">₹{(item.qty * item.rate).toFixed(2)}</td>
                  <td className="td">
                    <X size={16} className="text-red-600 cursor-pointer" onClick={() => removeItem(i)} />
                  </td>
                </tr>
              ))}
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

        {/* SUMMARY + TOTAL IN WORDS */}
        <div className="flex flex-row justify-between p-10">
          <div className="mb-6 bg-gray-50 w-[250px] h-[200px] p-10">
            <div className="flex justify-between">
              <p className="font-medium">Total (in words)</p>
              <Eye />
            </div>
            <p className="text-sm">{numberToWords(totals.grandTotal)}</p>
          </div>

>>>>>>> d69b7d5 (Initial commit)
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center font-semibold">
              <span>Show Total (PDF)</span>
              <Eye />
            </div>

<<<<<<< HEAD
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
=======
            <div className="flex justify-between"><span>Amount</span><span>₹{totals.amount.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>SGST</span><span>₹{totals.sgst.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>CGST</span><span>₹{totals.cgst.toFixed(2)}</span></div>
>>>>>>> d69b7d5 (Initial commit)

            <input
              className="input-sm"
              placeholder="Add Discounts"
              type="number"
<<<<<<< HEAD
              onChange={(e) =>
                setExtras({ ...extras, discount: Number(e.target.value) })
              }
=======
              onChange={(e) => setExtras({ ...extras, discount: Number(e.target.value) })}
>>>>>>> d69b7d5 (Initial commit)
            />
            <input
              className="input-sm"
              placeholder="Add Additional Charges"
              type="number"
<<<<<<< HEAD
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
=======
              onChange={(e) => setExtras({ ...extras, charges: Number(e.target.value) })}
            />

            <div className="flex gap-2">
              <button type="button" className="btn-sm" onClick={() => setExtras({ ...extras, round: 1 })}>Round Up</button>
              <button type="button" className="btn-sm" onClick={() => setExtras({ ...extras, round: -1 })}>Round Down</button>
>>>>>>> d69b7d5 (Initial commit)
            </div>

            <hr />

<<<<<<< HEAD
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
=======
            <div className="flex justify-between font-semibold"><span>Total Qty</span><span>{totals.totalQty}</span></div>
            <div className="flex justify-between text-lg font-bold"><span>Total</span><span>₹{totals.grandTotal.toFixed(2)}</span></div>
          </div>
        </div>

        {/* FILE UPLOADS */}
        <div className="grid md:grid-cols-3 gap-4 justify-items-center mb-6">
          <label className="flex items-center justify-center gap-3 px-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 w-64 h-10">
            <FileText size={18} /> <span className="text-sm text-gray-600 text-center">Add Terms & Conditions</span>
            <input type="file" accept=".pdf,.doc,.docx" className="hidden" />
          </label>
          <label className="flex items-center justify-center gap-3 px-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 w-64 h-10">
            <StickyNote size={18} /> <span className="text-sm text-gray-600 text-center">Add Notes</span>
            <input type="file" accept=".txt,.pdf,.doc,.docx" className="hidden" />
          </label>
          <label className="flex items-center justify-center gap-3 px-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 w-64 h-10">
            <Paperclip size={18} /> <span className="text-sm text-gray-600 text-center">Add Attachments</span>
            <input type="file" multiple className="hidden" />
          </label>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-center gap-4 mt-6">
          <button type="button" className="bg-[#D9D9D9] text-black px-6 py-3 rounded-lg" onClick={calculateTotal}>
            Calculate Total
          </button>
          <button type="button" className="bg-blue-500 text-white px-6 py-3 rounded-lg" onClick={handlePreview}>
            Preview
          </button>
          <button type="button" className="bg-green-500 text-white px-6 py-3 rounded-lg" onClick={handleSaveInvoice}>
            Save Invoice
          </button>
>>>>>>> d69b7d5 (Initial commit)
        </div>
      </form>
    </div>
  );
}
