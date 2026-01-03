"use client";

import { useState, useEffect } from "react";
import { X, Eye, FileText, StickyNote, Paperclip, Info, Phone } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  FaFileInvoiceDollar,
  FaUsers,
  FaChartBar,
  FaMoneyCheckAlt,
  FaCog,
  FaUserCircle,
  FaSearch,
  FaBars,
  FaTimes,
} from "react-icons/fa";

type Item = {
  itemName: string;
  hsn: string;
  gst: number;
  qty: number;
  rate: number;
};


export default function InvoicePage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Invoices");
  const [user, setUser] = useState<{ username: string; email?: string } | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [errors, setErrors] = useState<any>({
    billedBy: {},
    billedTo: {},
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.replace("/login");
    } else {
      setUser(JSON.parse(storedUser));
    }
    setLoadingUser(false);
  }, [router]);
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

  /* ---------------- Business Details ---------------- */
  const [billedBy, setBilledBy] = useState({
    country: "",
    businessName: "",
    email: "",          // ✅ ADD THIS
    phone: "",
    gstin: "",
    address: "",
    city: "",
  });


  const [billedTo, setBilledTo] = useState({
    country: "",
    businessName: "",
    email: "",          // ✅ ADD THIS
    phone: "",
    gstin: "",
    address: "",
    city: "",
  });


  /* ---------------- Item handlers ---------------- */
  const addItem = () =>
    setItems([...items, { itemName: "", hsn: "", gst: 0, qty: 1, rate: 0 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  const handleChange = (index: number, field: keyof Item, value: string) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: field === "itemName" || field === "hsn" ? value : Number(value),
    };
    setItems(updated);
  };

  /* ---------------- Validation ---------------- */
  const validateInvoice = () => {
    if (!invoiceMeta.invoiceNumber || !invoiceMeta.invoiceDate || !invoiceMeta.dueDate) {
      alert("Please fill all invoice details.");
      return false;
    }
    if (
      !isValidPhone(billedBy.phone) ||
      !isValidPhone(billedTo.phone)
    ) {
      alert("Please enter valid 10-digit mobile numbers.");
      return false;
    }


    for (const key in billedBy) {
      if (!(billedBy as any)[key]) {
        alert(`Please fill Billed By field: ${key}`);
        return false;
      }
    }

    for (const key in billedTo) {
      if (!(billedTo as any)[key]) {
        alert(`Please fill Billed To field: ${key}`);
        return false;
      }
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.itemName || !item.hsn || item.gst === null || item.qty === null || item.rate === null) {
        alert(`Please fill all fields for Item ${i + 1}`);
        return false;
      }
    }

    return true;
  };

  /* ---------------- Totals Calculation ---------------- */
  const computeTotals = () => {
    let amount = 0, cgst = 0, sgst = 0, qty = 0;

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
    if (extras.round === -1) grand = Math.floor(grand);

    return { amount, cgst, sgst, totalQty: qty, grandTotal: grand };
  };

  const handleCalculate = () => {
    if (!validateInvoice()) return;
    const calculatedTotals = computeTotals();
    setTotals(calculatedTotals);
  };

  const handleSaveInvoice = async (e?: React.FormEvent) => {
  e?.preventDefault();
  if (!validateInvoice()) return;

  setIsSaving(true); // 🔹 START saving

  try {
    const invoiceDate = new Date(invoiceMeta.invoiceDate);
    const dueDate = new Date(invoiceMeta.dueDate);

    const calculatedTotals = computeTotals();

    const invoiceData = {
      invoiceNumber: invoiceMeta.invoiceNumber.trim(),
      invoiceDate,
      dueDate,
      billedBy,
      billedTo,
      items,
      extras,
      totals: calculatedTotals,
      totalInWords: `${calculatedTotals.grandTotal} rupees only`,
        userId: (user as any)?._id || ""
    };

    const res = await fetch("/api/auth/invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invoiceData),
    });

    const data = await res.json();

    if (data.success) {
      alert("Invoice saved successfully!");
    } else {
      alert("Failed to save invoice: " + data.error);
    }
  } catch (err: any) {
    console.error(err);
    alert("Error saving invoice");
  } finally {
    setIsSaving(false); // 🔹 END saving (success or error)
  }
};


  const menuItems = [
    { icon: <FaFileInvoiceDollar />, label: "Invoices", path: "/dashboard" },
    { icon: <FaUsers />, label: "Clients", path: "/clients" },
    { icon: <FaChartBar />, label: "Reports", path: "/reports" },
    { icon: <FaMoneyCheckAlt />, label: "Payments", path: "/payments" },
    { icon: <FaCog />, label: "Settings", path: "/settings" },
  ];

  /* ---------------- Preview ---------------- */
  const handlePreview = () => {
    if (!validateInvoice()) return;

    const calculatedTotals = computeTotals();
    setTotals(calculatedTotals);

    const invoiceData = {
      invoiceNumber: invoiceMeta.invoiceNumber.trim(),
      invoiceDate: new Date(invoiceMeta.invoiceDate),
      dueDate: new Date(invoiceMeta.dueDate),
      billedBy,
      billedTo,
      items,
      extras,
      totals: calculatedTotals,
      totalInWords: `${calculatedTotals.grandTotal} rupees only`,
      userId: (user as any)?._id || "", // user._id must come from login

    };




    localStorage.setItem("invoiceData", JSON.stringify(invoiceData));
    router.push("/preview");
  };

  const numberToWords = (num: number) => `${num} rupees only`;



  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const isValidPhone = (value: string) => /^\d{10}$/.test(value);


  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 shadow">
        <div className="text-xl font-bold cursor-pointer mb-3 md:mb-0">
          {/* LOGO */}
        </div>

        <div className="md:hidden flex items-center mb-3">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        <div
          className={`flex flex-col md:flex-row md:items-center md:space-x-10 w-full md:w-auto ${menuOpen ? "flex" : "hidden md:flex"
            }`}
        >
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 mb-3 md:mb-0">
            {menuItems.map((item) => (
              <MenuItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                isActive={activeMenu === item.label}
                onClick={() => {
                  setActiveMenu(item.label); // set active menu
                  if (item.path) router.push(item.path); // navigate to page
                }}
              />
            ))}
          </div>

          <div className="flex flex-col items-end space-y-2">
            <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded shadow">
              <FaUserCircle size={28} />
              <span className="font-medium">{user?.username || "User"}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:underline"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      <form className="max-w-7xl mx-auto bg-white rounded-xl shadow p-6">
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
              setInvoiceMeta({ ...invoiceMeta, invoiceNumber: e.target.value })
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

        {/* REST OF THE FORM REMAINS EXACTLY THE SAME */}
        {/* Billed By / Billed To / Items / Summary / File Uploads / Buttons */}
        {/* ...your existing JSX continues without any changes */}







        {/* BILLED DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="bg-gray-50 p-5 rounded-lg">
            <h3 className="font-semibold mb-4">Billed By (Your Details)</h3>
            <div className="grid gap-3">


              {Object.keys(billedBy).map((key) => (
                <div key={key}>
                  <input
                    type={key === "email" ? "email" : "text"}
                    className={`input ${errors.billedBy?.[key] ? "border-red-500" : ""
                      }`}
                    placeholder={
                      key === "email"
                        ? "Email ID"
                        : key === "phone"
                          ? "Mobile Number"
                          : key.replace(/([A-Z])/g, " $1")
                    }
                    value={(billedBy as any)[key]}
                    onChange={(e) => {
                      const value = e.target.value;

                      setBilledBy({ ...billedBy, [key]: value });

                      // Phone validation
                      if (key === "phone") {
                        setErrors((prev: any) => ({
                          ...prev,
                          billedBy: {
                            ...prev.billedBy,
                            phone:
                              value && !isValidPhone(value)
                                ? "Mobile number must be 10 digits"
                                : "",
                          },
                        }));
                      }
                    }}
                  />

                  {/* ERROR MESSAGE */}
                  {errors.billedBy?.[key] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.billedBy[key]}
                    </p>
                  )}
                </div>
              ))}

            </div>
          </div>

          <div className="bg-gray-50 p-5 rounded-lg">

            <h3 className="font-semibold mb-4">Billed To (Client’s Details)</h3>
            <div className="grid gap-3">
              {Object.keys(billedTo).map((key) => (
                <div key={key}>
                  <input
                    type={key === "email" ? "email" : "text"}
                    className={`input ${errors.billedTo?.[key] ? "border-red-500" : ""
                      }`}
                    placeholder={
                      key === "email"
                        ? "Email ID"
                        : key === "phone"
                          ? "Mobile Number"
                          : key.replace(/([A-Z])/g, " $1")
                    }
                    value={(billedTo as any)[key]}
                    onChange={(e) => {
                      const value = e.target.value;

                      setBilledTo({ ...billedTo, [key]: value });

                      if (key === "phone") {
                        setErrors((prev: any) => ({
                          ...prev,
                          billedTo: {
                            ...prev.billedTo,
                            phone:
                              value && !isValidPhone(value)
                                ? "Mobile number must be 10 digits"
                                : "",
                          },
                        }));
                      }
                    }}
                  />

                  {/* ERROR MESSAGE */}
                  {errors.billedTo?.[key] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.billedTo[key]}
                    </p>
                  )}
                </div>
              ))}


            </div>
          </div>
        </div>




        {/* ITEMS + SUMMARY */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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



          {/* SUMMARY + TOTAL IN WORDS */}


        </div>
        <div>
          <div className="flex flex-row justify-between p-10">
            <div className="mb-6 bg-gray-50 w-[250px] h-[200px] p-10">
              <div className="flex justify-between">
                <p className="font-medium">Total (in words)</p>
                <Eye />
              </div>
              <p className="text-sm">{numberToWords(totals.grandTotal)}</p>
            </div>

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

              <div className="flex justify-between"><span>Amount</span><span>₹{totals.amount.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>SGST</span><span>₹{totals.sgst.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>CGST</span><span>₹{totals.cgst.toFixed(2)}</span></div>

              <input
                className="input-sm"
                placeholder="Add Discounts"
                type="number"
                onChange={(e) =>
                  setExtras({ ...extras, discount: Number(e.target.value) })
                }
              ></input>
              <input
                className="input-sm"
                placeholder="Add Additional Charges"
                type="number"
                onChange={(e) =>
                  setExtras({ ...extras, charges: Number(e.target.value) })
                }
              />

              <div className="flex gap-2">




                <div className="flex gap-2">
                  <button type="button" className="btn-sm" onClick={() => setExtras({ ...extras, round: 1 })}>Round Up</button>
                  <button type="button" className="btn-sm" onClick={() => setExtras({ ...extras, round: -1 })}>Round Down</button>
                </div>

                <hr />


                <div className="mt-4">
                  <div className="flex justify-between font-semibold">
                    <span>Total Qty</span>
                    <span>{totals.totalQty}</span>
                  </div>

                  <div className="flex justify-between text-lg font-bold mt-1">
                    <span>Total</span>
                    <span>₹{totals.grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TOTAL IN WORDS */}


            {/* EXTRA INPUTS */}




            {/* ACTION */}

          </div>

          {/* FILE UPLOADS */}
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
            <div>
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
            </div>

            {/* Last 2 uploads */}
            <div>
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
          </div>

          {/* ACTION BUTTONS */}



        </div>
        <div className="flex flex-col items-center gap-4 mt-6">
          <button
            type="button"
            onClick={handleCalculate}
            className="w-[300px] bg-gray-300 text-black py-3 px-4 rounded-lg cursor-pointer"
          >
            Calculate Total
          </button>

          <button
            type="button"
            onClick={handlePreview}
            className="w-[300px] text-black underline py-3 px-4 rounded-lg cursor-pointer"
          >
            Preview
          </button>

          <button
            type="button"
            onClick={handleSaveInvoice}
            className={`w-[300px] py-3 px-4 rounded-lg transition
    ${isSaving
                ? "bg-green-500 text-white cursor-not-allowed pointer-events-none"
                : "bg-green-500 hover:bg-green-600 text-white"
              }`}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>


        </div>

      </form>
    </div>

  );
}

const MenuItem = ({ icon, label, isActive, onClick }: any) => (
  <div
    onClick={onClick}
    className={`flex flex-row gap-2 items-center cursor-pointer whitespace-nowrap ${isActive ? "text-[#8F90DF] underline" : "text-black"
      }`}
  >
    {icon}
    <span>{label}</span>
  </div>
);