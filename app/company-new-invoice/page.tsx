"use client";
import { authFetch } from "@/utils/authFetch";
import TetrominosLoader from "../_components/TetrominosLoader";

import { useState, useEffect, useRef } from "react";
import { X, Eye, FileText, StickyNote, Paperclip, Info, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  FaFileInvoiceDollar,
  FaUsers,
  FaChartBar,
  FaMoneyCheckAlt,
  FaCog,
  FaUserCircle,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { motion, Variants } from "framer-motion";
type Item = {
  itemName: string;
  hsn: string;
  gst: number;
  qty: number;
  rate: number;
};

type InvoiceFiles = {
  signature?: File | null;
  notes?: File | null;
  terms: File[];          // always an array
  attachments: File[];    // always an array
  additionalInfo: File[]; // always an array
  contactDetails: File[]; // always an array
};


export default function InvoicePage() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Invoices");
  const [user, setUser] = useState<{ _id: string; username: string; email?: string } | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
   const [showLoader, setShowLoader] = useState(true);
    useEffect(() => {
      // Show loader for 3 seconds
      const timer = setTimeout(() => {
        setShowLoader(false);
      }, 1200); // 3000ms = 3 seconds
  
      return () => clearTimeout(timer); // cleanup
    }, []);

  /* ---------------- Logo ---------------- */
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ---------------- Invoice Files ---------------- */
  const [invoiceFiles, setInvoiceFiles] = useState<InvoiceFiles>({
    signature: null,
    notes: null,
    terms: [],
    attachments: [],
    additionalInfo: [],
    contactDetails: [],
  });

  /* ---------------- Invoice Meta ---------------- */
  const [invoiceMeta, setInvoiceMeta] = useState({
    invoiceNumber: "",
    invoiceDate: "",
    dueDate: "",
  });

  /* ---------------- Items ---------------- */
  const [items, setItems] = useState<Item[]>([{ itemName: "", hsn: "", gst: 0, qty: 1, rate: 0 }]);

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

  /* ---------------- Billed By / Billed To ---------------- */
  const [billedBy, setBilledBy] = useState({
    country: "",
    businessName: "",
    email: "",
    phone: "",
    gstin: "",
    address: "",
    city: "",
  });

  const [billedTo, setBilledTo] = useState({
    country: "",
    businessName: "",
    email: "",
    phone: "",
    gstin: "",
    address: "",
    city: "",
  });

  /* ---------------- User Validation ---------------- */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return router.replace("/login");
    const parsedUser = JSON.parse(storedUser);
    if (!parsedUser._id) return router.replace("/login");
    setUser(parsedUser);
    setLoadingUser(false);
  }, [router]);

  /* ---------------- File to Base64 ---------------- */
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });

  /* ---------------- File Handlers ---------------- */
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setLogoFile(file);
    const base64 = await fileToBase64(file);
    setLogoPreview(base64);
  };

  const handleFileChange = (key: keyof InvoiceFiles, files: FileList | null) => {
    if (!files) return;

    if (key === "attachments" || key === "terms" || key === "additionalInfo" || key === "contactDetails") {
      setInvoiceFiles((prev) => ({ ...prev, [key]: Array.from(files) }));
    } else {
      setInvoiceFiles((prev) => ({ ...prev, [key]: files[0] }));
    }
  };

  /* ---------------- Items Handlers ---------------- */
  const addItem = () => setItems([...items, { itemName: "", hsn: "", gst: 0, qty: 1, rate: 0 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  const handleChange = (index: number, field: keyof Item, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: field === "itemName" || field === "hsn" ? value : Number(value) };
    setItems(updated);
  };

  /* ---------------- Validation ---------------- */
  const isValidPhone = (value: string) => /^\d{10}$/.test(value);
  const validateInvoice = () => {
    if (!invoiceMeta.invoiceNumber || !invoiceMeta.invoiceDate || !invoiceMeta.dueDate) {
      alert("Please fill all invoice details.");
      return false;
    }
    if (!isValidPhone(billedBy.phone) || !isValidPhone(billedTo.phone)) {
      alert("Please enter valid 10-digit mobile numbers.");
      return false;
    }

    for (const key in billedBy) if (!(billedBy as any)[key]) { alert(`Fill Billed By: ${key}`); return false; }
    for (const key in billedTo) if (!(billedTo as any)[key]) { alert(`Fill Billed To: ${key}`); return false; }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.itemName || !item.hsn || item.gst === null || item.qty === null || item.rate === null) {
        alert(`Fill all fields for Item ${i + 1}`);
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
  const handleCalculate = () => { if (!validateInvoice()) return; setTotals(computeTotals()); };
  const numberToWords = (num: number) => `${num} rupees only`;

  /* ---------------- Preview ---------------- */
  const handlePreview = async () => {
    if (!validateInvoice()) return;

    const calculatedTotals = computeTotals();
    setTotals(calculatedTotals);

    // Convert all files to base64
    const convertFilesToBase64 = async (files: File[]) => {
      const promises = files.map(file => fileToBase64(file));
      return Promise.all(promises);
    };

    const invoiceFilesBase64 = {
      signature: invoiceFiles.signature ? await fileToBase64(invoiceFiles.signature) : null,
      notes: invoiceFiles.notes ? await fileToBase64(invoiceFiles.notes) : null,
      terms: await convertFilesToBase64(invoiceFiles.terms),
      attachments: await convertFilesToBase64(invoiceFiles.attachments),
      additionalInfo: await convertFilesToBase64(invoiceFiles.additionalInfo),
      contactDetails: await convertFilesToBase64(invoiceFiles.contactDetails),
    };

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
      logoUrl: logoPreview || "",
      files: invoiceFilesBase64,  // ✅ include all files for preview
    };

    localStorage.setItem("invoiceData", JSON.stringify(invoiceData));
    router.push("/preview");
  };


  /* ---------------- Save Invoice ---------------- */
  const handleSaveInvoice = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validateInvoice()) return;
    if (!user?._id) { alert("User not logged in"); return router.push("/login"); }
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");
    setIsSaving(true);

    try {
      const calculatedTotals = computeTotals();
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
        logoUrl: logoPreview || "",
        userId: user._id,
      };

      const formData = new FormData();
      formData.append("data", JSON.stringify(invoiceData));

      // Files
      if (invoiceFiles.signature) formData.append("signature", invoiceFiles.signature);
      if (invoiceFiles.notes) formData.append("notes", invoiceFiles.notes);
      if (invoiceFiles.terms) invoiceFiles.terms.forEach(f => formData.append("terms", f));
      if (invoiceFiles.attachments) invoiceFiles.attachments.forEach(f => formData.append("attachments", f));
      if (invoiceFiles.additionalInfo) invoiceFiles.additionalInfo.forEach(f => formData.append("additionalInfo", f));
      if (invoiceFiles.contactDetails) invoiceFiles.contactDetails.forEach(f => formData.append("contactDetails", f));

      if (logoFile) formData.append("file", logoFile);

      const result = await authFetch("/api/auth/invoice", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      // If authFetch already returns JSON
      if (result?.success || result?.message || !result?.error) {
        alert("Invoice saved successfully!");
      } else {
        alert(`Failed: ${result.error}`);
      }

    } catch (err) { console.error(err); alert("Error saving invoice."); }
    finally { setIsSaving(false); }
  };

  /* ---------------- Logout ---------------- */

const handleLogout = async () => {
  try {
    const res = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include", // ✅ REQUIRED
    });

    if (!res.ok) throw new Error("Logout failed");

    const data = await res.json();
    console.log(data.message);

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    router.replace("/"); 
  } catch (err) {
    console.error("Logout failed:", err);
  }
};

useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return router.push("/login"); // redirect if no token

  const loadCompanySettings = async () => {
    try {
      const res = await authFetch("/api/auth/company/settings", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      if (res.status === 401) {
        return router.push("/login"); // redirect if token invalid
      }

      const data = await res.json();
      setInvoiceMeta((prev) => ({ ...prev, invoiceNumber: data.billedBy?.invoicePrefix || "" }));
      setItems((prev) => prev.map((item) => ({ ...item, gst: data.billedBy?.gstRate || 18 })));
      if (data.logoUrl) setLogoPreview(data.logoUrl);
      setBilledBy({
        country: data.billedBy?.country || "",
        businessName: data.billedBy?.businessName || "",
        email: data.billedBy?.email || "",
        phone: data.billedBy?.phone || "",
        gstin: data.billedBy?.gstin || "",
        address: data.billedBy?.address || "",
        city: data.billedBy?.city || "",
      });
    } catch (err) {
      console.error("Error loading company settings:", err);
    }
  };

  loadCompanySettings();
}, []);

  /* ---------------- Menu Items ---------------- */
  const menuItems = [
    { icon: <FaFileInvoiceDollar />, label: "Invoices", path: "/dashboard" },
    { icon: <FaUsers />, label: "Clients", path: "/clients" },
    { icon: <FaChartBar />, label: "Reports", path: "/reports" },
    { icon: <FaMoneyCheckAlt />, label: "Payments", path: "/payments" },
    { icon: <FaCog />, label: "Settings", path: "/settings" },
  ];

  if (loadingUser) return <div>Loading...</div>;
  const navbarVariants: Variants = {
    hidden: { y: -100, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
  };

  // Summary boxes stagger
  const summaryContainerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
  };


  // Total revenue box appears after summary boxes

  // Recent invoices appear last
  const recentInvoicesVariants: Variants = {
    hidden: { y: -50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut", delay: 1 } },
  };


  const summaryItemVariants: Variants = {
    hidden: { y: -50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const revenueVariants: Variants = {
    hidden: { y: -50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut", delay: 0.6 } },
  };
  const itemVariant: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };
  const staggerContainer: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };
  if (showLoader) {
    return (
      <div className="relative w-full h-screen flex items-center justify-center bg-gray-50">
        <TetrominosLoader />
      </div>
    );
  }
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible" className="min-h-screen bg-gray-100 p-6">
      {/* ---------------- HEADER + MENU ---------------- */}
      <motion.div
        variants={navbarVariants}
        initial="hidden"
        animate="visible" className="bg-white rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 shadow">
        <div className="text-xl font-bold cursor-pointer mb-3 md:mb-0">Invoice System</div>
        <div className="md:hidden flex items-center mb-3">
          <button onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}</button>
        </div>
        <div className={`flex flex-col md:flex-row md:items-center md:space-x-10 w-full md:w-auto ${menuOpen ? "flex" : "hidden md:flex"}`}>
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 mb-3 md:mb-0">
            {menuItems.map(item => (
              <MenuItem key={item.label} icon={item.icon} label={item.label} isActive={activeMenu === item.label} onClick={() => { setActiveMenu(item.label); router.push(item.path); }} />
            ))}
          </div>
          <div className="flex flex-col items-end space-y-2">
            <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded shadow">
              <FaUserCircle size={28} />
              <span className="font-medium">{user?.username || "User"}</span>
            </div>
            <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">Logout</button>
          </div>
        </div>
      </motion.div>

      {/* ---------------- FORM START ---------------- */}

      <motion.form variants={itemVariant} className="max-w-7xl mx-auto bg-white rounded-xl shadow p-6">
        {/* HEADER + LOGO */}
        <motion.div variants={itemVariant} className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold">Invoice</h1>
          <div onClick={() => fileInputRef.current?.click()} className="w-20 h-20 border border-dashed rounded flex items-center justify-center cursor-pointer overflow-hidden hover:bg-gray-50">
            {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" /> : <span className="text-sm text-gray-500">Logo</span>}
          </div>
          <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleLogoChange} />
        </motion.div>

        {/* ... Keep ALL your original JSX for Invoice Meta, Billed By/To, Items, Totals, File Uploads, Buttons ... */}
        <motion.div variants={itemVariant} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="flex flex-col gap-1">
            <label className="ext-sm font-medium text-gray-700">
              Invoice Number
            </label>

            <input
              className="w-full p-2 bg-white dark:bg-gray-900 text-black dark:text-white border-2 border-black dark:border-white rounded-md focus:outline-none focus:ring-0"
              placeholder="Invoice Number"
              required
              value={invoiceMeta.invoiceNumber}
              onChange={(e) =>
                setInvoiceMeta({ ...invoiceMeta, invoiceNumber: e.target.value })
              }
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Date
            </label>

            <input
              className="w-full p-2 bg-white dark:bg-gray-900 text-black dark:text-white border-2 border-black dark:border-white rounded-md focus:outline-none focus:ring-0"
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
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Due Date
            </label>
            <input
              className="w-full p-2 bg-white dark:bg-gray-900 text-black dark:text-white border-2 border-black dark:border-white rounded-md focus:outline-none focus:ring-0"
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
        </motion.div>

        {/* REST OF THE FORM REMAINS EXACTLY THE SAME */}
        {/* Billed By / Billed To / Items / Summary / File Uploads / Buttons */}
        {/* ...your existing JSX continues without any changes */}







        {/* BILLED DETAILS */}





        {/* ITEMS + SUMMARY */}
        {/* ---------------- BILLED DETAILS ---------------- */}
        <motion.div variants={itemVariant} className="flex flex-col md:flex-row gap-8 mb-10 justify-center">
          {/* Billed By */}
          <div className="md:w-6/12 flex flex-col p-10 gap-6 bg-gray-200">
            <h3 className="font-semibold mb-3">Billed By (Your Details)</h3>
            {(Object.keys(billedBy) as (keyof typeof billedBy)[]).map((key) => {
              const value = billedBy[key];
              return (
                <div key={key} className="relative">
                  <input
                    type={key === "email" ? "email" : "text"}
                    placeholder=" "
                    value={value}
                    onChange={(e) => setBilledBy({ ...billedBy, [key]: e.target.value })}
                    className="peer w-full border-b-2 border-gray-300 bg-transparent pt-5 pb-2 text-sm text-gray-900 placeholder-transparent
                       focus:outline-none focus:border-black transition-colors duration-200"
                  />
                  <label
                    className={`absolute left-0 text-gray-400 text-sm transition-all
          ${value ? 'top-0 text-blue-500 text-sm' : 'top-5 peer-placeholder-shown:text-gray-500 peer-placeholder-shown:text-base'}
          peer-focus:top-0 peer-focus:text-black-500 peer-focus:text-sm`}
                  >
                    {key === "email" ? "Email" : key === "phone" ? "Phone" : key.replace(/([A-Z])/g, " $1")}
                  </label>
                </div>
              );
            })}

          </div>

          {/* Billed To */}
          <div className="md:w-6/12 flex flex-col p-10 gap-6 bg-gray-200">
            <h3 className="font-semibold mb-3">Billed To (Client’s Details)</h3>
            {Object.keys(billedTo).map((key) => {
              const value = (billedTo as any)[key];
              return (
                <div key={key} className="relative">
                  <input
                    type={key === "email" ? "email" : "text"}
                    placeholder=" "
                    value={value}
                    onChange={(e) =>
                      setBilledTo({ ...billedTo, [key]: e.target.value })
                    }
                    className="peer w-full border-b-2 border-gray-300 bg-transparent pt-5 pb-2 text-sm text-gray-900 placeholder-transparent
                       focus:outline-none focus:border-black transition-colors duration-200"
                  />
                  <label
                    className={`absolute left-0 text-gray-400 text-sm transition-all
                        ${value ? 'top-0 text-blue-500 text-sm' : 'top-5 peer-placeholder-shown:text-gray-500 peer-placeholder-shown:text-base'}
                        peer-focus:top-0 peer-focus:text-black-500 peer-focus:text-sm`}
                  >
                    {key === "email"
                      ? "Email"
                      : key === "phone"
                        ? "Phone"
                        : key.replace(/([A-Z])/g, " $1")}
                  </label>
                </div>
              );
            })}
          </div>
        </motion.div>


        {/* ---------------- ITEMS TABLE FULL WIDTH ---------------- */}
        <motion.div variants={itemVariant} className="mb-8 overflow-x-auto w-full">
          <table className="w-full border border-gray-300 text-sm border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 border border-gray-300">Item</th>
                <th className="p-2 border border-gray-300">HSN</th>
                <th className="p-2 border border-gray-300">GST%</th>
                <th className="p-2 border border-gray-300">Qty</th>
                <th className="p-2 border border-gray-300">Rate</th>
                <th className="p-2 border border-gray-300">Amount</th>
                <th className="p-2 border border-gray-300"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const amount = item.qty * item.rate;
                return (
                  <tr key={i}>
                    <td className="p-2 border border-gray-300">
                      <input
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                        required
                        value={item.itemName}
                        onChange={(e) => handleChange(i, "itemName", e.target.value)}
                      />
                    </td>
                    <td className="p-2 border border-gray-300">
                      <input
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                        required
                        value={item.hsn}
                        onChange={(e) => handleChange(i, "hsn", e.target.value)}
                      />
                    </td>
                    <td className="p-2 border border-gray-300">
                      <input
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                        type="number"
                        value={item.gst}
                        required
                        onChange={(e) => handleChange(i, "gst", e.target.value)}
                      />
                    </td>
                    <td className="p-2 border border-gray-300">
                      <input
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                        type="number"
                        value={item.qty}
                        required
                        onChange={(e) => handleChange(i, "qty", e.target.value)}
                      />
                    </td>
                    <td className="p-2 border border-gray-300">
                      <input
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                        type="number"
                        value={item.rate}
                        required
                        onChange={(e) => handleChange(i, "rate", e.target.value)}
                      />
                    </td>
                    <td className="p-2 border border-gray-300">₹{amount.toFixed(2)}</td>
                    <td className="p-2 border border-gray-300 text-center">
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
            className="w-full mt-3 bg-gray-200 py-2 rounded border border-gray-300 hover:bg-gray-300 transition"
          >
            + Add New Item
          </button>
        </motion.div>


        <motion.div variants={itemVariant}>
          <div className="bg-white dark:bg-gray-900 flex flex-row justify-between p-10">
            <div className="bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-white mb-6 bg-gray-50 w-[250px] h-[200px] p-10">

              <div className="flex justify-between">
                <p className="font-medium bg-white dark:bg-gray-900">Total (in words)</p>
                <Eye />
              </div>
              <p className="text-sm">{numberToWords(totals.grandTotal)}</p>
            </div>

            <div className="bg-white dark:bg-gray-900 border-2  bg-gray-50 p-4 rounded-lg space-y-3">
              <div className=" flex justify-between items-center font-semibold">
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


          {/* ACTION BUTTONS */}



        </motion.div>
        <motion.div variants={itemVariant} className="flex flex-col items-center gap-4 mt-6">
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
            className="bg-white dark:bg-gray-900 w-[300px] text-black underline py-3 px-4 rounded-lg cursor-pointer"
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


        </motion.div>

      </motion.form>
    </motion.div>
  );
}

const MenuItem = ({ icon, label, isActive, onClick }: any) => (
  <div onClick={onClick} className={`bg-white dark:bg-gray-900 flex flex-row gap-2 items-center cursor-pointer whitespace-nowrap ${isActive ? "text-[#8F90DF] underline" : "text-black"}`}>
    {icon} <span>{label}</span>
  </div>
);
