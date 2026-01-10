"use client";
import { authFetch} from "@/utils/authFetch"; 
import { useEffect, useState, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Edit2, Download, Send, FileText, StickyNote, Paperclip, Info, Phone } from "lucide-react";
import { FaFileInvoiceDollar, FaUsers, FaChartBar, FaMoneyCheckAlt, FaCog, FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import { motion, Variants } from "framer-motion";
import TetrominosLoader from "../_components/TetrominosLoader";

type InvoiceFiles = {
  signature?: File | null;
  notes?: File | null;
  terms: File[];
  attachments: File[];
  additionalInfo: File[];
  contactDetails: File[];
};

const InvoicePreview = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const invoiceRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<{ username: string; email?: string; _id?: string; logoUrl?: string } | null>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Invoices");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
 const [showLoader, setShowLoader] = useState(true);
  useEffect(() => {
    // Show loader for 3 seconds
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 1200); // 3000ms = 3 seconds

    return () => clearTimeout(timer); // cleanup
  }, []);
  const [invoiceFiles, setInvoiceFiles] = useState<InvoiceFiles>({
    signature: null,
    notes: null,
    terms: [],
    attachments: [],
    additionalInfo: [],
    contactDetails: [],
  });

  /* ---------------- LOAD USER ---------------- */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.replace("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [router]);

  /* ---------------- LOAD INVOICE ---------------- */
  useEffect(() => {
    const dataFromStorage = localStorage.getItem("invoiceData");
    if (dataFromStorage) {
      setInvoice(JSON.parse(dataFromStorage));
      return;
    }
    const data = searchParams.get("data");
    if (data) setInvoice(JSON.parse(data));
  }, [searchParams]);

  /* ---------------- TOTALS ---------------- */
  const totals = useMemo(() => {
    if (!invoice) return { amount: 0, cgst: 0, sgst: 0, totalQty: 0, grandTotal: 0 };
    let amount = 0, cgst = 0, sgst = 0, totalQty = 0;

    invoice.items.forEach((item: any) => {
      const rowAmount = item.qty * item.rate;
      const gstHalf = item.gst / 2;
      amount += rowAmount;
      cgst += (rowAmount * gstHalf) / 100;
      sgst += (rowAmount * gstHalf) / 100;
      totalQty += item.qty;
    });

    const grandTotal = amount + cgst + sgst - (invoice.extras?.discount || 0) + (invoice.extras?.charges || 0);
    return { amount, cgst, sgst, totalQty, grandTotal };
  }, [invoice]);

  const totalInWords = `${totals.grandTotal} rupees only`;

  /* ---------------- SAVE INVOICE ---------------- */
 const saveInvoice = async () => {
  if (!user) return alert("Please login");
  if (!invoice) return alert("Invoice not loaded");

  try {
    const token = localStorage.getItem("token");
    if (!token) return alert("Unauthorized. Please login again.");

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        ...invoice,
        totals,
        totalInWords,
        logoUrl: logoPreview || invoice.logoUrl || "",
      })
    );

    attachments.forEach((file) => formData.append("files", file));

    // 🔥 authFetch ALREADY RETURNS JSON
    const data = await authFetch("/api/auth/invoice", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (data?.error) {
      return alert(data.error);
    }

    alert("Invoice saved successfully!");
    localStorage.setItem("invoiceData", JSON.stringify(data.invoice));
    setInvoice(data.invoice);
    setAttachments([]);
  } catch (err) {
    console.error("Save invoice error:", err);
    alert("Network error. Invoice not saved.");
  }
};


  /* ---------------- PDF GENERATION ---------------- */
  const generatePDF = async () => {
    if (!invoiceRef.current) return alert("Invoice content not found");

    try {
      const html2canvasModule = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const element = invoiceRef.current;
      const canvas = await html2canvasModule(element, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        pdf.addPage();
        position = heightLeft - imgHeight < 0 ? 0 : heightLeft - imgHeight;
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`Invoice-${invoice?.invoiceNumber || "0000"}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Failed to generate PDF.");
    }
  };

  /* ---------------- SEND INVOICE ---------------- */
const sendInvoice = async () => {
  if (!email) return alert("Enter recipient email");

  try {
    setSending(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("invoice", JSON.stringify(invoice));
    formData.append("totals", JSON.stringify(totals));
    formData.append("totalInWords", totalInWords);
    formData.append("logoUrl", invoice.logoUrl || "");

    const allFiles: File[] = [
      ...(invoiceFiles.terms || []),
      ...(invoiceFiles.attachments || []),
      ...(invoiceFiles.additionalInfo || []),
      ...(invoiceFiles.contactDetails || []),
      ...(invoiceFiles.notes ? [invoiceFiles.notes] : []),
      ...(invoiceFiles.signature ? [invoiceFiles.signature] : []),
    ];

    allFiles.forEach((file) => formData.append("files", file));

    // ✅ authFetch already returns parsed JSON
    const data = await authFetch("/api/auth/send-invoice", {
      method: "POST",
      body: formData,
    });

    if (!data?.success) {
      throw new Error(data?.error || "Failed to send invoice");
    }

    setSuccessMsg("Invoice sent successfully!");

    setInvoiceFiles({
      signature: null,
      notes: null,
      terms: [],
      attachments: [],
      additionalInfo: [],
      contactDetails: [],
    });

    setEmail("");
  } catch (err: any) {
    alert(err.message);
  } finally {
    setSending(false);
  }
};



  /* ---------------- ITEMS ---------------- */
  const handleItemChange = (index: number, field: string, value: any) => {
    if (!invoice) return;
    const updatedItems = [...invoice.items];
    updatedItems[index][field] = field === "itemName" || field === "hsn" ? value : Number(value);
    setInvoice({ ...invoice, items: updatedItems });
  };

  const addNewItem = () =>
    invoice &&
    setInvoice({
      ...invoice,
      items: [...invoice.items, { itemName: "", hsn: "", gst: 0, qty: 1, rate: 0 }],
    });

  const removeItem = (index: number) =>
    invoice &&
    setInvoice({ ...invoice, items: invoice.items.filter((_: any, i: number) => i !== index) });

  const formatDate = (date?: string | Date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  };


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


 

  const menuItems = [
    { icon: <FaFileInvoiceDollar />, label: "Invoices", path: "/dashboard" },
    { icon: <FaUsers />, label: "Clients", path: "/clients" },
    { icon: <FaChartBar />, label: "Reports", path: "/reports" },
    { icon: <FaMoneyCheckAlt />, label: "Payments", path: "/payments" },
    { icon: <FaCog />, label: "Settings", path: "/settings" },
  ];

  const handleFileChange = (key: keyof InvoiceFiles, files: FileList | null) => {
    if (!files) return;

    if (["attachments", "terms", "additionalInfo", "contactDetails"].includes(key)) {
      setInvoiceFiles((prev) => ({ ...prev, [key]: Array.from(files) }));
    } else {
      setInvoiceFiles((prev) => ({ ...prev, [key]: files[0] }));
    }
  };
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
      {/* Navbar */}
        <motion.div
        variants={navbarVariants}
        initial="hidden"
        animate="visible" className="bg-white rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 shadow">
        <div className="text-xl font-bold cursor-pointer mb-3 md:mb-0">Invoice Preview</div>
        <div className="md:hidden flex items-center mb-3">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
        <div className={`flex flex-col md:flex-row md:items-center md:space-x-10 w-full md:w-auto ${menuOpen ? "flex" : "hidden md:flex"}`}>
          {menuItems.map((item) => (
            <MenuItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              isActive={activeMenu === item.label}
              onClick={() => {
                setActiveMenu(item.label);
                router.push(item.path);
              }}
            />
          ))}
          <div className="flex flex-col items-end space-y-2">
            <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded shadow">
              <FaUserCircle size={28} />
              <span className="font-medium">{user?.username || "User"}</span>
            </div>
            <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">
              Logout
            </button>
          </div>
        </div>
      </motion.div>

      {/* Invoice Preview */}
      <motion.div variants={itemVariant}ref={invoiceRef} className="max-w-5xl mx-auto bg-white p-6 rounded shadow space-y-6">
        {/* Billed By */}
        <div className="flex justify-between mb-6">
          <div>
            <h2 className="font-bold">{invoice.billedBy.businessName || "Your Business"}</h2>
            <p>{invoice.billedBy.address}, {invoice.billedBy.city}</p>
            <p>{invoice.billedBy.country}</p>
            <p>Phone: {invoice.billedBy.phone}</p>
            <p>GSTIN: {invoice.billedBy.gstin}</p>
          </div>
          <div className="text-right">
            {invoice.logoUrl && <img src={invoice.logoUrl} alt="Company Logo" className="h-16 object-contain mb-2" />}
            <p>Invoice Number: {invoice.invoiceNumber}</p>
            <p>Date: {formatDate(invoice.invoiceDate)}</p>
            <p>Due Date: {formatDate(invoice.dueDate)}</p>
          </div>
        </div>

        {/* Billed To */}
        <div>
          <h3 className="font-semibold">Billed To (Client)</h3>
          <p>{invoice.billedTo.businessName || "Client Name"}</p>
          <p>{invoice.billedTo.address}, {invoice.billedTo.city}</p>
          <p>{invoice.billedTo.country}</p>
          <p>Phone: {invoice.billedTo.phone}</p>
          <p>GSTIN: {invoice.billedTo.gstin}</p>
        </div>

        {/* Items Table */}
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="border px-3 py-2 text-left">Item</th>
              <th className="border px-3 py-2 text-left">HSN</th>
              <th className="border px-3 py-2 text-right">GST%</th>
              <th className="border px-3 py-2 text-right">Qty</th>
              <th className="border px-3 py-2 text-right">Rate</th>
              <th className="border px-3 py-2 text-right">Amount</th>
              {editMode && <th className="border px-3 py-2">Action</th>}
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item: any, i: number) => (
              <tr key={i}>
                <td className="border px-3 py-2">{editMode ? <input className="w-full px-1 py-1" value={item.itemName} onChange={(e) => handleItemChange(i, "itemName", e.target.value)} /> : item.itemName}</td>
                <td className="border px-3 py-2">{editMode ? <input className="w-full px-1 py-1" value={item.hsn} onChange={(e) => handleItemChange(i, "hsn", e.target.value)} /> : item.hsn}</td>
                <td className="border px-3 py-2 text-right">{editMode ? <input className="w-full px-1 py-1 text-right" type="number" value={item.gst} onChange={(e) => handleItemChange(i, "gst", e.target.value)} /> : item.gst}</td>
                <td className="border px-3 py-2 text-right">{editMode ? <input className="w-full px-1 py-1 text-right" type="number" value={item.qty} onChange={(e) => handleItemChange(i, "qty", e.target.value)} /> : item.qty}</td>
                <td className="border px-3 py-2 text-right">{editMode ? <input className="w-full px-1 py-1 text-right" type="number" value={item.rate} onChange={(e) => handleItemChange(i, "rate", e.target.value)} /> : item.rate}</td>
                <td className="border px-3 py-2 text-right">₹{(item.qty * item.rate).toFixed(2)}</td>
                {editMode && <td className="border px-3 py-2 text-center"><button className="text-red-500 font-bold" onClick={() => removeItem(i)}>✕</button></td>}
              </tr>
            ))}
          </tbody>
        </table>

        {editMode && (
          <div className="flex justify-end mb-4">
            <button className="btn bg-green-500 text-white px-4 py-2 rounded" onClick={addNewItem}>+ Add Item</button>
          </div>
        )}

        {/* Totals */}
        <div className="flex justify-end text-right mb-4">
          <div className="w-1/3 space-y-1">
            <p>Amount: ₹{totals.amount.toFixed(2)}</p>
            <p>CGST: ₹{totals.cgst.toFixed(2)}</p>
            <p>SGST: ₹{totals.sgst.toFixed(2)}</p>
            <p className="font-semibold">Discount: ₹{invoice.extras?.discount || 0}</p>
            <p className="font-semibold">Additional Charges: ₹{invoice.extras?.charges || 0}</p>
            <p className="font-bold text-lg">Grand Total: ₹{totals.grandTotal.toFixed(2)}</p>
            <p className="italic">Total in words: {totalInWords}</p>
          </div>
        </div>

        {/* File Upload Sections (Terms, Notes, Attachments, Additional Info, Contact Details) */}
        {/* ... Your existing file upload JSX remains unchanged ... */}

      </motion.div>
     <motion.div variants={itemVariant} className="p-10">
        <div className="grid md:grid-cols-3 gap-4 justify-items-center">
          {/* Terms & Conditions */}
          {/* Terms & Conditions */}
          <div className="flex flex-col items-start mb-4 w-64">
            <label className="flex items-center justify-center gap-3 px-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 w-full h-10">
              <FileText size={18} className="text-gray-500" />
              <span className="bg-white dark:bg-gray-900 text-sm text-gray-600 text-center">
                Add Terms & Conditions
              </span>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileChange("terms", e.target.files ?? null)}
              />
            </label>

            {invoiceFiles.terms.length > 0 && (
              <div className="mt-2 text-sm text-gray-700 w-full">
                {invoiceFiles.terms.map((file, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-100 px-2 py-1 rounded mb-1">
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...invoiceFiles.terms];
                        updated.splice(index, 1);
                        setInvoiceFiles({ ...invoiceFiles, terms: updated });
                      }}
                      className="text-red-500 font-bold ml-2"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>


          {/* Display uploaded terms */}
          {/* {invoiceFiles.terms.length > 0 && (
                          <div className="mt-1 text-sm text-gray-700">
                            {invoiceFiles.terms.map((file, index) => (
                              <div key={index} className="flex justify-between items-center bg-gray-100 px-2 py-1 rounded mb-1">
                                <span>{file.name}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...invoiceFiles.terms];
                                    updated.splice(index, 1);
                                    setInvoiceFiles({ ...invoiceFiles, terms: updated });
                                  }}
                                  className="text-red-500 font-bold ml-2"
                                >
                                  X
                                </button>
                              </div>
                            ))}
                          </div>
                        )} */}


          {/* Notes */}
          <div className="mb-4">
            <label className="flex items-center justify-center gap-3 px-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 w-64 h-10">
              <StickyNote size={18} className="text-gray-500" />
              <span className="bg-white dark:bg-gray-900 text-sm text-gray-600 text-center">
                Add Notes
              </span>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => handleFileChange("notes", e.target.files ?? null)}
              />
            </label>

            {invoiceFiles.notes && (
              <div className="mt-1 text-sm text-gray-700 flex justify-between items-center bg-gray-100 px-2 py-1 rounded w-64">
                <span>{invoiceFiles.notes.name}</span>
                <button
                  type="button"
                  onClick={() => setInvoiceFiles({ ...invoiceFiles, notes: null })}
                  className="text-red-500 font-bold ml-2"
                >
                  X
                </button>
              </div>
            )}
          </div>


          {/* Attachments */}
          <div className="mb-4">
            <label className="flex items-center justify-center gap-3 px-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 w-64 h-10">
              <Paperclip size={18} className="text-gray-500" />
              <span className="bg-white dark:bg-gray-900 text-sm text-gray-600 text-center">
                Add Attachments
              </span>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileChange("attachments", e.target.files ?? null)}
              />
            </label>

            {invoiceFiles.attachments.length > 0 && (
              <div className="mt-1 text-sm text-gray-700 w-64">
                {invoiceFiles.attachments.map((file, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-100 px-2 py-1 rounded mb-1">
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...invoiceFiles.attachments];
                        updated.splice(index, 1);
                        setInvoiceFiles({ ...invoiceFiles, attachments: updated });
                      }}
                      className="text-red-500 font-bold ml-2"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </motion.div>
 <motion.div variants={itemVariant}className="grid md:grid-cols-2 gap-4 justify-items-center mt-4">
        {/* Additional Info */}
        <div className="mb-4">
          <label className="flex items-center justify-center gap-3 px-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 w-64 h-10">
            <Info size={18} className="text-gray-500" />
            <span className="bg-white dark:bg-gray-900 text-sm text-gray-600 text-center">
              Additional Information
            </span>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFileChange("additionalInfo", e.target.files ?? null)}
            />
          </label>

          {invoiceFiles.additionalInfo.length > 0 && (
            <div className="mt-1 text-sm text-gray-700 w-64">
              {invoiceFiles.additionalInfo.map((file, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-100 px-2 py-1 rounded mb-1">
                  <span>{file.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...invoiceFiles.additionalInfo];
                      updated.splice(index, 1);
                      setInvoiceFiles({ ...invoiceFiles, additionalInfo: updated });
                    }}
                    className="text-red-500 font-bold ml-2"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Details */}
        <div className="mb-4">
          <label className="flex items-center justify-center gap-3 px-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 w-64 h-10">
            <Phone size={18} className="text-gray-500" />
            <span className="bg-white dark:bg-gray-900 text-sm text-gray-600 text-center">
              Contact Details
            </span>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFileChange("contactDetails", e.target.files ?? null)}
            />
          </label>

          {invoiceFiles.contactDetails.length > 0 && (
            <div className="mt-1 text-sm text-gray-700 w-64">
              {invoiceFiles.contactDetails.map((file, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-100 px-2 py-1 rounded mb-1">
                  <span>{file.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...invoiceFiles.contactDetails];
                      updated.splice(index, 1);
                      setInvoiceFiles({ ...invoiceFiles, contactDetails: updated });
                    }}
                    className="text-red-500 font-bold ml-2"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
<motion.div variants={itemVariant} className="flex justify-center gap-4 m-4">
        <button className="btn bg-gray-300 px-4 py-2 rounded flex items-center gap-2" onClick={saveInvoice}><Edit2 size={16} /> Save Invoice</button>
        <button className="btn bg-gray-300 px-4 py-2 rounded flex items-center gap-2" onClick={async () => { if (editMode) await saveInvoice(); setEditMode(!editMode); }}><Edit2 size={16} /> {editMode ? "Finish Edit" : "Edit Invoice"}</button>
        <button className="btn bg-gray-300 px-4 py-2 rounded flex items-center gap-2" onClick={() => setShowEmailForm(!showEmailForm)}><Send size={16} /> Send Invoice</button>
      </motion.div>

      {showEmailForm && (
        <div className="flex justify-center gap-2 mb-6">
          <input type="email" placeholder="Enter recipient email" value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 rounded" />
          <button
            onClick={sendInvoice}
            disabled={sending}
            className={`px-4 py-2 rounded text-white ${sending ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500"}`}
          >
            {sending ? "Sending..." : "Send PDF"}
          </button>
        </div>
      )}

      {successMsg && (
        <p className="text-green-600 text-center font-medium mt-2">{successMsg}</p>
      )}

      <div className="flex justify-center mb-6">
        <button className="bg-gray-300 text-black px-6 py-2 rounded flex items-center gap-2 cursor-pointer" onClick={generatePDF}><Download size={16} /> Download PDF</button>
      </div>
    </motion.div>
  );
};

const MenuItem = ({ icon, label, isActive, onClick }: any) => (
  <div onClick={onClick} className={`flex flex-row gap-2 items-center cursor-pointer whitespace-nowrap ${isActive ? "text-[#8F90DF] underline" : "text-black"}`}>
    {icon}
    <span>{label}</span>
  </div>
);

export default InvoicePreview;
