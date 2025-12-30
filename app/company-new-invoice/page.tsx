"use client";

import { useState } from "react";
import { X, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

type Item = {
  itemName: string;
  hsn: string;
  gst: number;
  qty: number;
  rate: number;
};

export default function InvoicePage() {
  const router = useRouter();

  const [invoiceMeta, setInvoiceMeta] = useState({
    invoiceNumber: "",
    invoiceDate: "",
    dueDate: "",
  });

  const [items, setItems] = useState<Item[]>([
    { itemName: "", hsn: "", gst: 0, qty: 1, rate: 0 },
  ]);

  const [extras, setExtras] = useState({ discount: 0, charges: 0, round: 0 });

  const [totals, setTotals] = useState({
    amount: 0,
    cgst: 0,
    sgst: 0,
    grandTotal: 0,
    totalQty: 0,
  });

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

  const calculateTotal = () => {
    let amount = 0,
      cgst = 0,
      sgst = 0,
      qty = 0;

    items.forEach((item) => {
      const rowAmount = item.qty * item.rate;
      const gstHalf = item.gst / 2;

      amount += rowAmount;
      cgst += (rowAmount * gstHalf) / 100;
      sgst += (rowAmount * gstHalf) / 100;
      qty += item.qty;
    });

    let grand = amount + cgst + sgst - extras.discount + extras.charges;
    if (extras.round === 1) grand = Math.ceil(grand);
    else if (extras.round === -1) grand = Math.floor(grand);

    setTotals({ amount, cgst, sgst, totalQty: qty, grandTotal: grand });
  };

  const numberToWords = (num: number) => `${num} rupees only`;

  const validateInvoice = (): boolean => {
    // Validate invoice meta
    if (!invoiceMeta.invoiceNumber || !invoiceMeta.invoiceDate || !invoiceMeta.dueDate) {
      alert("Please fill all invoice details.");
      return false;
    }

    // Validate billedBy
    for (const key in billedBy) {
      if (!(billedBy as any)[key]) {
        alert(`Please fill Billed By: ${key}`);
        return false;
      }
    }

    // Validate billedTo
    for (const key in billedTo) {
      if (!(billedTo as any)[key]) {
        alert(`Please fill Billed To: ${key}`);
        return false;
      }
    }

    // Validate items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.itemName || !item.hsn || item.gst === null || item.qty === null || item.rate === null) {
        alert(`Please fill all fields for item ${i + 1}`);
        return false;
      }
    }

    return true;
  };

  const handleCalculateTotal = () => {
    if (!validateInvoice()) return;
    calculateTotal();
  };

  const handlePreviewClick = () => {
    if (!validateInvoice()) return;

    calculateTotal();
    const dataStr = encodeURIComponent(
      JSON.stringify({
        invoiceMeta,
        billedBy,
        billedTo,
        items,
        extras,
        totals,
        totalInWords: numberToWords(totals.grandTotal),
      })
    );
    router.push(`/preview?data=${dataStr}`);
  };

  const handleSaveInvoice = async () => {
    if (!validateInvoice()) return;
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
      uploadedFiles: {},
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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <form className="max-w-7xl mx-auto bg-white rounded-xl shadow p-6" onSubmit={(e) => e.preventDefault()}>
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
  <h1 className="text-3xl font-semibold">Invoice</h1>

  {/* Image Upload */}
  <label className="border border-dashed p-10 rounded cursor-pointer bg-gray-50 hover:bg-gray-100 flex items-center gap-2">
    <span>Add Business Logo</span>
    <input
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            console.log("Uploaded Image Data URL:", reader.result);
            // You can store the image in state to display it
          };
          reader.readAsDataURL(file);
        }
      }}
    />
  </label>
</div>


        {/* INVOICE META */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
  <div className="flex flex-col">
    <label className="font-medium mb-1">Invoice Number</label>
    <input
      className="input"
      placeholder="Invoice Number"
      required
      value={invoiceMeta.invoiceNumber}
      onChange={(e) => setInvoiceMeta({ ...invoiceMeta, invoiceNumber: e.target.value })}
    />
  </div>

  <div className="flex flex-col">
    <label className="font-medium mb-1">Invoice Date</label>
    <input
      className="input"
      type="date"
      required
      value={invoiceMeta.invoiceDate}
      onChange={(e) => setInvoiceMeta({ ...invoiceMeta, invoiceDate: e.target.value })}
    />
  </div>

  <div className="flex flex-col">
    <label className="font-medium mb-1">Invoice Due Date</label>
    <input
      className="input"
      type="date"
      required
      value={invoiceMeta.dueDate}
      onChange={(e) => setInvoiceMeta({ ...invoiceMeta, dueDate: e.target.value })}
    />
  </div>
</div>


        {/* BILLED DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="bg-gray-50 p-5 rounded-lg">
            <h3 className="font-semibold mb-4">Billed By (Your Details)</h3>
            <div className="flex flex-col space-y-3">
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
            </div>
          </div>

          <div className="bg-gray-50 p-5 rounded-lg">
            <h3 className="font-semibold mb-4">Billed To (Client’s Details)</h3>
            <div className="flex flex-col space-y-3">
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
            </div>
          </div>
        </div>

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
                  <td className="td"><input className="input-sm" value={item.itemName} onChange={(e) => handleChange(i, "itemName", e.target.value)} /></td>
                  <td className="td"><input className="input-sm" value={item.hsn} onChange={(e) => handleChange(i, "hsn", e.target.value)} /></td>
                  <td className="td"><input className="input-sm" type="number" value={item.gst} onChange={(e) => handleChange(i, "gst", e.target.value)} /></td>
                  <td className="td"><input className="input-sm" type="number" value={item.qty} onChange={(e) => handleChange(i, "qty", e.target.value)} /></td>
                  <td className="td"><input className="input-sm" type="number" value={item.rate} onChange={(e) => handleChange(i, "rate", e.target.value)} /></td>
                  <td className="td">₹{(item.qty * item.rate).toFixed(2)}</td>
                  <td className="td"><X size={16} className="text-red-600 cursor-pointer" onClick={() => removeItem(i)} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          <button type="button" onClick={addItem} className="w-full mt-3 bg-gray-200 py-2 rounded">+ Add New Item</button>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col gap-4 mt-6 items-center">
          <button
            type="button"
            className="bg-[#D9D9D9] text-black px-6 py-3 w-[160px] rounded-lg"
            onClick={handleCalculateTotal}
          >
            Calculate Total
          </button>

          <button
            type="button"
            className="text-black underline px-6 py-3 w-[160px] rounded-lg"
            onClick={handlePreviewClick}
          >
            Preview
          </button>

          <button
            type="button"
            className="bg-[#D9D9D9] text-black px-6 py-3 w-[160px] rounded-lg"
            onClick={handleSaveInvoice}
          >
            Save Invoice
          </button>
        </div>
      </form>
    </div>
  );
}
