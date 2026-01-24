"use client";
import { authFetch } from "@/utils/authFetch";
import { useEffect, useState, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Edit2,
  Download,
  Send,
  FileText,
  StickyNote,
  Paperclip,
  Info,
  Phone,
} from "lucide-react";
import {
  FaFileInvoiceDollar,
  FaUsers,
  FaChartBar,
  FaMoneyCheckAlt,
  FaCog,
  FaUserCircle,
  FaBars,
  FaTimes,
  FaPhoneAlt
} from "react-icons/fa";
import { motion, Variants } from "framer-motion";
import TetrominosLoader from "../_components/TetrominosLoader";
import { numberToWords } from "@/utils/numberToWords";

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

  const [user, setUser] = useState<{
    username: string;
    email?: string;
    _id?: string;
    logoUrl?: string;
  } | null>(null);
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
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const [popup, setPopup] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    type: "info",
  });

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
      const parsed = JSON.parse(dataFromStorage);
      setInvoice(parsed); // parsed should include _id if it exists in DB
      return;
    }
    const data = searchParams.get("data");
    if (data) setInvoice(JSON.parse(data));
  }, [searchParams]);

  /* ---------------- TOTALS ---------------- */
  const totals = useMemo(() => {
    if (!invoice)
      return { amount: 0, cgst: 0, sgst: 0, totalQty: 0, grandTotal: 0 };
    let amount = 0,
      cgst = 0,
      sgst = 0,
      totalQty = 0;

    invoice.items.forEach((item: any) => {
      const rowAmount = item.qty * item.rate;
      const gstHalf = item.gst / 2;
      amount += rowAmount;
      cgst += (rowAmount * gstHalf) / 100;
      sgst += (rowAmount * gstHalf) / 100;
      totalQty += item.qty;
    });

    const grandTotal =
      amount +
      cgst +
      sgst -
      (invoice.extras?.discount || 0) +
      (invoice.extras?.charges || 0);
    return { amount, cgst, sgst, totalQty, grandTotal };
  }, [invoice]);

  const totalInWords = useMemo(() => {
    if (!totals?.grandTotal || isNaN(totals.grandTotal))
      return "Zero rupees only";

    const grand = totals.grandTotal.toFixed(2); // ensures 2 decimal places as string
    const [integerPart, decimalPart] = grand.split(".").map(Number); // split into 129 and 80

    let words = numberToWords(integerPart) + " Rupees";

    if (decimalPart && decimalPart > 0) {
      words += ` and ${numberToWords(decimalPart)} Paise`;
    }

    return words + " Only";
  }, [totals?.grandTotal]);

  const sendInvoiceToClient = async (savedInvoice: any, email: string) => {
    const formData = new FormData();

    formData.append("email", email);
    formData.append("invoice", JSON.stringify(savedInvoice));
    formData.append("totals", JSON.stringify(totals));
    formData.append("totalInWords", totalInWords);
    formData.append("logoUrl", savedInvoice.logoUrl || "");

    const allFiles: File[] = [
      ...(invoiceFiles.terms || []),
      ...(invoiceFiles.attachments || []),
      ...(invoiceFiles.additionalInfo || []),
      ...(invoiceFiles.contactDetails || []),
      ...(invoiceFiles.notes ? [invoiceFiles.notes] : []),
      ...(invoiceFiles.signature ? [invoiceFiles.signature] : []),
    ];

    allFiles.forEach((file) => formData.append("files", file));

    const res = await authFetch("/api/auth/send-invoice", {
      method: "POST",
      body: formData,
    });

    if (!res?.success) {
      throw new Error(res?.error || "Failed to send invoice email");
    }
  };
  const runWithOverlay = async (fn: () => Promise<void> | void) => {
    setShowOverlay(true);
    try {
      await fn();
    } finally {
      setShowOverlay(false);
    }
  };
  const saveInvoice = async () => {
    setShowOverlay(true);
    if (!user) {
      setPopup({
        open: true,
        message: "Please login",
        type: "error",
      });
      return;
    }

    if (!invoice) {
      setPopup({
        open: true,
        message: "Invoice not loaded",
        type: "error",
      });
      return;
    }

    const recipientEmail = invoice?.billedTo?.email;
    if (!recipientEmail) {
      setPopup({
        open: true,
        message: "Client email not found",
        type: "error",
      });
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("token");
      if (!token) {
        setPopup({
          open: true,
          message: "Unauthorized. Please login again.",
          type: "error",
        });
        return;
      }

      const formData = new FormData();

      // ---------- Invoice data ----------
      formData.append(
        "data",
        JSON.stringify({
          ...invoice,
          totals,
          totalInWords,
          logoUrl: logoPreview || invoice.logoUrl || "",
        }),
      );

      // ---------- Files ----------
      if (invoiceFiles.signature)
        formData.append("signature", invoiceFiles.signature);
      if (invoiceFiles.notes) formData.append("notes", invoiceFiles.notes);

      invoiceFiles.terms.forEach((f) => formData.append("terms", f));
      invoiceFiles.attachments.forEach((f) =>
        formData.append("attachments", f),
      );
      invoiceFiles.additionalInfo.forEach((f) =>
        formData.append("additionalInfo", f),
      );
      invoiceFiles.contactDetails.forEach((f) =>
        formData.append("contactDetails", f),
      );

      // ---------- Update existing ----------
      if (invoice._id) {
        formData.append("_id", invoice._id);
      }

      // ✅ SAVE INVOICE
      const data = await authFetch("/api/auth/invoice", {
        method: "POST",
        body: formData,
      });

      if (!data?.success) {
        setPopup({
          open: true,
          message: data?.error || "Failed to save invoice",
          type: "error",
        });
        return;
      }

      // ✅ UPDATE STATE
      setInvoice(data.invoice);
      localStorage.setItem("invoiceData", JSON.stringify(data.invoice));

      // ✅ AUTO SEND EMAIL AFTER SAVE
      await sendInvoiceToClient(data.invoice, recipientEmail);

      setPopup({
        open: true,
        message: "Invoice saved and sent successfully!",
        type: "success",
      });

      // ---------- Reset files ----------
      setInvoiceFiles({
        signature: null,
        notes: null,
        terms: [],
        attachments: [],
        additionalInfo: [],
        contactDetails: [],
      });
    } catch (err) {
      console.error("Save invoice error:", err);
      setPopup({
        open: true,
        message: "Invoice saved but email failed.",
        type: "error",
      });
    } finally {
      setSaving(false);
      setShowOverlay(false);
    }
  };

  /* ---------------- PDF GENERATION ---------------- */
const generatePDF = async () => {
  if (!invoiceRef.current) {
    setPopup({
      open: true,
      message: "Invoice content not found",
      type: "error",
    });
    return;
  }

  try {
    setDownloading(true);

    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");

    const element = invoiceRef.current;

    // ✅ CLONE THE INVOICE (DO NOT TOUCH REAL UI)
    const clone = element.cloneNode(true) as HTMLElement;

    clone.style.width = "794px"; // A4 width
    clone.style.position = "fixed";
    clone.style.top = "-9999px";
    clone.style.left = "-9999px";
    clone.style.background = "#ffffff";
    clone.style.transform = "scale(1)";
    clone.style.overflow = "hidden";

    document.body.appendChild(clone);

    // ✅ CAPTURE CLONE
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: 794,
    });

    // 🧹 CLEANUP
    document.body.removeChild(clone);

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // ✅ FIRST PAGE
    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    // ✅ NEXT PAGES
    while (heightLeft > 0) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(`Invoice-${invoice?.invoiceNumber || "0000"}.pdf`);
  } catch (err) {
    console.error("PDF generation error:", err);
    setPopup({
      open: true,
      message: "Failed to generate PDF.",
      type: "error",
    });
  } finally {
    setDownloading(false);
  }
};




  /* ---------------- SEND INVOICE ---------------- */
  const sendInvoice = async () => {
    if (!email) {
      setPopup({
        open: true,
        message: "Enter recipient email",
        type: "error",
      });
      return;
    }

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

      setPopup({
        open: true,
        message: "Invoice sent successfully!",
        type: "success",
      });

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
      setPopup({
        open: true,
        message: err.message,
        type: "error",
      });
    } finally {
      setSending(false);
    }
  };

  /* ---------------- ITEMS ---------------- */
  const handleItemChange = (index: number, field: string, value: any) => {
    if (!invoice) return;
    const updatedItems = [...invoice.items];
    updatedItems[index][field] =
      field === "itemName" || field === "hsn" ? value : Number(value);
    setInvoice({ ...invoice, items: updatedItems });
  };

  const addNewItem = () =>
    invoice &&
    setInvoice({
      ...invoice,
      items: [
        ...invoice.items,
        { itemName: "", hsn: "", gst: 0, qty: 1, rate: 0 },
      ],
    });

  const removeItem = (index: number) =>
    invoice &&
    setInvoice({
      ...invoice,
      items: invoice.items.filter((_: any, i: number) => i !== index),
    });

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
    { icon: <FaPhoneAlt />, label: "Contact us", path: "/contact" },
  ];

  const handleFileChange = (
    key: keyof InvoiceFiles,
    files: FileList | null,
  ) => {
    if (!files) return;

    if (
      ["attachments", "terms", "additionalInfo", "contactDetails"].includes(key)
    ) {
      setInvoiceFiles((prev) => ({ ...prev, [key]: Array.from(files) }));
    } else {
      setInvoiceFiles((prev) => ({ ...prev, [key]: files[0] }));
    }
  };
  const navbarVariants: Variants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
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
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut", delay: 1 },
    },
  };

  const summaryItemVariants: Variants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const revenueVariants: Variants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut", delay: 0.6 },
    },
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
      animate="visible"
      className="min-h-screen bg-gray-200 p-4 md:p-6"
    >
      {/* Navbar */}
      {showOverlay && (
        <div className="fixed inset-0 bg-gray-300/70 z-[9999] flex items-center justify-center overflow-hidden">
          {/* Popup box */}
          <div className="rounded-xl px-8 py-6 shadow-lg flex flex-col items-center gap-4">
            <TetrominosLoader />
          </div>
        </div>
      )}
      <motion.div
        variants={navbarVariants}
        initial="hidden"
        animate="visible"
        className="glass rounded-2xl  p-4 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 shadow"
      >
        <motion.div
          variants={itemVariant}
          className="text-xl font-bold cursor-pointer mb-3 md:mb-0"
        >
          {/* LOGO */}
        </motion.div>

        <motion.div
          variants={itemVariant}
          className="md:hidden flex items-center mb-3"
        >
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </motion.div>

        <motion.div
          variants={itemVariant}
          className={`flex flex-col md:flex-row md:items-center md:space-x-10 w-full md:w-auto ${
            menuOpen ? "flex" : "hidden md:flex"
          }`}
        >
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

          <div className="flex flex-col items-end space-y-2">
            <div className="glass flex items-center space-x-3 px-4 py-2 rounded-xl">
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
        </motion.div>
      </motion.div>

      {/* Invoice Preview */}
      <motion.div
        variants={itemVariant}
        ref={invoiceRef}
        className="pdf-root w-full max-w-5xl mx-auto bg-white 
             p-3 sm:p-4 md:p-6 
             rounded-lg shadow space-y-6 
             overflow-x-hidden"
      >
        {/* Billed By */}
        <div className="border border-black p-4 rounded">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-6">
            <div>

              <h2 className="font-bold">
                {invoice?.billedBy?.businessName || "Your Business"}
              </h2>
              <p>
                {invoice?.billedBy?.address}, {invoice?.billedBy?.city}
              </p>
              <p>{invoice?.billedBy?.country}</p>
              <p>
                <b>Phone: </b>
                {invoice?.billedBy?.phone}
              </p>
              <p>
                <b>GSTIN: </b>
                {invoice?.billedBy?.gstin}
              </p>
            </div>
            <div className="text-right">
              {invoice?.logoUrl && (
                <img
                  src={invoice.logoUrl}
                  alt="Company Logo"
                  className="h-12 sm:h-16 max-w-[140px] object-contain mb-2 ml-auto"
                />
              )}
              <p>
                <b>Invoice Number: </b>
                {invoice?.invoiceNumber}
              </p>
              <p>
                <b>Date: </b>
                {formatDate(invoice?.invoiceDate)}
              </p>
              <p>
                <b>Due Date:</b> {formatDate(invoice?.dueDate)}
              </p>
            </div>
          </div>

          {/* Billed To */}
          <div>
            <h3 className="font-semibold">Billed To (Client)</h3>
            <p>{invoice?.billedTo?.businessName || "Client Name"}</p>
            <p>
              {invoice?.billedTo?.address}, {invoice?.billedTo?.city}
            </p>
            <p>{invoice?.billedTo?.country}</p>
            <p>
              <b>Phone:</b> {invoice?.billedTo?.phone}
            </p>
            <p>
              <b>GSTIN:</b> {invoice?.billedTo?.gstin}
            </p>
          </div>

          {/* Items Table */}
          {/* ===== DESKTOP TABLE ===== */}
          <div className="hidden md:block">
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
                {invoice?.items.map((item: any, i: number) => (
                  <tr key={i}>
                    <td className="border px-3 py-2">
                      {editMode ? (
                        <input
                          value={item.itemName}
                          onChange={(e) =>
                            handleItemChange(i, "itemName", e.target.value)
                          }
                          className="w-full border rounded px-2 py-1"
                        />
                      ) : (
                        item.itemName
                      )}
                    </td>

                    <td className="border px-3 py-2">
                      {editMode ? (
                        <input
                          value={item.hsn}
                          onChange={(e) =>
                            handleItemChange(i, "hsn", e.target.value)
                          }
                          className="w-full border rounded px-2 py-1"
                        />
                      ) : (
                        item.hsn
                      )}
                    </td>
                    <td className="border px-3 py-2 text-right">
                      {editMode ? (
                        <input
                          type="number"
                          value={item.gst}
                          onChange={(e) =>
                            handleItemChange(i, "gst", e.target.value)
                          }
                          className="w-20 border rounded px-2 py-1 text-right"
                        />
                      ) : (
                        item.gst
                      )}
                    </td>
                    <td className="border px-3 py-2 text-right">
                      {editMode ? (
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) =>
                            handleItemChange(i, "qty", e.target.value)
                          }
                          className="w-20 border rounded px-2 py-1 text-right"
                        />
                      ) : (
                        item.qty
                      )}
                    </td>

                    <td className="border px-3 py-2 text-right">
                      {editMode ? (
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) =>
                            handleItemChange(i, "rate", e.target.value)
                          }
                          className="w-24 border rounded px-2 py-1 text-right"
                        />
                      ) : (
                        item.rate
                      )}
                    </td>
                    <td className="border px-3 py-2 text-right">
                      ₹{(item.qty * item.rate).toFixed(2)}
                    </td>
                    {editMode && (
                      <td className="border px-3 py-2 text-center">
                        <button
                          className="text-red-500 font-bold"
                          onClick={() => removeItem(i)}
                        >
                          ✕
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* ===== MOBILE TABLE-CARDS (THEAD → LEFT | VALUE → RIGHT) ===== */}
          <div className="md:hidden space-y-4">
            {invoice?.items.map((item: any, i: number) => (
              <div key={i} className="border rounded-lg p-4 bg-white shadow-sm">
                {/* Item Name */}
                <div className="flex justify-between py-1">
                  <span className=" text-sm">Item</span>
                  <span className="font-medium text-right">
                    {item.itemName || "-"}
                  </span>
                </div>

                <div className="flex justify-between py-1">
                  <span className=" text-sm">HSN</span>
                  <span>{item.hsn || "-"}</span>
                </div>

                <div className="flex justify-between py-1">
                  <span className=" text-sm">GST %</span>
                  <span>{item.gst}%</span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-sm">Quantity</span>
                  <span>{item.qty}</span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-sm">Rate</span>
                  <span>₹{item.rate}</span>
                </div>

                <div className="flex justify-between py-2 border-t mt-2 font-semibold">
                  <span>Amount</span>
                  <span>₹{(item.qty * item.rate).toFixed(2)}</span>
                </div>

                {editMode && (
                  <button
                    onClick={() => removeItem(i)}
                    className="mt-3 text-red-600 text-sm underline"
                  >
                    Remove Item
                  </button>
                )}
              </div>
            ))}
          </div>

          {editMode && (
            <div className="flex justify-end mb-4">
              <button
                className="btn bg-green-500 text-white px-4 py-2 rounded"
                onClick={addNewItem}
              >
                + Add Item
              </button>
            </div>
          )}

          {/* Totals */}
          <div className="flex justify-end text-right mb-4 sm:text-right p-2">
            <div className="sm:w-2/3 space-y-1">
              <p>Amount: ₹{totals.amount.toFixed(2)}</p>
              <p>CGST: ₹{totals.cgst.toFixed(2)}</p>
              <p>SGST: ₹{totals.sgst.toFixed(2)}</p>
              <p className="font-semibold">
                Discount: ₹{invoice?.extras?.discount || 0}
              </p>
              <p className="font-semibold">
                Additional Charges: ₹{invoice?.extras?.charges || 0}
              </p>
              <p className="font-bold text-lg">
                Grand Total: ₹{totals?.grandTotal.toFixed(2)}
              </p>
              {invoice?.showTotalInWords && (
                <p className="italic">Total in words: {totalInWords}</p>
              )}
            </div>
          </div>

          {/* File Upload Sections (Terms, Notes, Attachments, Additional Info, Contact Details) */}
          {/* ... Your existing file upload JSX remains unchanged ... */}
        </div>
      </motion.div>

      <motion.div variants={itemVariant} className="p-10">
        <div className="flex flex-col items-center md:items-end mb-4 w-full md:w-64 md:ml-auto">
          <label className="flex items-center justify-center gap-3 px-4 border-2 border-dashed border-black rounded-lg cursor-pointer hover:bg-gray-50 w-full h-10">
            <FileText size={18} className="text-gray-500" />
            <span className=" text-sm text-gray-600 text-center">
              Add Signature
            </span>

            <input
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              className="hidden"
              onChange={(e) =>
                handleFileChange("signature", e.target.files ?? null)
              }
            />
          </label>

          {invoiceFiles.signature && (
            <div className="mt-2 text-sm text-gray-700 flex justify-between items-center bg-gray-100 px-2 py-1 rounded w-full">
              <span className="truncate">{invoiceFiles.signature.name}</span>
              <button
                type="button"
                onClick={() =>
                  setInvoiceFiles({ ...invoiceFiles, signature: null })
                }
                className="text-red-500 font-bold ml-2"
              >
                X
              </button>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div variants={itemVariant} className="p-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 justify-items-center">
          {/* Terms & Conditions */}
          {/* Terms & Conditions */}
          <div className="flex flex-col items-start mb-4 w-64">
            <label className="flex items-center justify-center gap-3 px-4 border-2 border-dashed border-black rounded-lg cursor-pointer hover:bg-gray-50 w-full h-10">
              <FileText size={18} className="text-gray-500" />
              <span className="text-sm text-gray-600 text-center">
                Add Terms & Conditions
              </span>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) =>
                  handleFileChange("terms", e.target.files ?? null)
                }
              />
            </label>

            {invoiceFiles.terms.length > 0 && (
              <div className="mt-2 text-sm text-gray-700 w-full">
                {invoiceFiles.terms.map((file, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-gray-100 px-2 py-1 rounded mb-1"
                  >
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
            <label className="flex items-center justify-center gap-3 px-4 border-2 border-dashed border-black rounded-lg cursor-pointer hover:bg-gray-50 w-64 h-10">
              <StickyNote size={18} className="text-gray-500" />
              <span className="text-sm text-gray-600 text-center">
                Add Notes
              </span>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) =>
                  handleFileChange("notes", e.target.files ?? null)
                }
              />
            </label>

            {invoiceFiles.notes && (
              <div className="mt-1 text-sm text-gray-700 flex justify-between items-center bg-gray-100 px-2 py-1 rounded w-64">
                <span>{invoiceFiles.notes.name}</span>
                <button
                  type="button"
                  onClick={() =>
                    setInvoiceFiles({ ...invoiceFiles, notes: null })
                  }
                  className="text-red-500 font-bold ml-2"
                >
                  X
                </button>
              </div>
            )}
          </div>

          {/* Attachments */}
          <div className="mb-4">
            <label className="flex items-center justify-center gap-3 px-4 border-2 border-dashed border-black rounded-lg cursor-pointer hover:bg-gray-50 w-64 h-10">
              <Paperclip size={18} className="text-gray-500" />
              <span className="text-sm text-gray-600 text-center">
                Add Attachments
              </span>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) =>
                  handleFileChange("attachments", e.target.files ?? null)
                }
              />
            </label>

            {invoiceFiles.attachments.length > 0 && (
              <div className="mt-1 text-sm text-gray-700 w-64">
                {invoiceFiles.attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-gray-100 px-2 py-1 rounded mb-1"
                  >
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...invoiceFiles.attachments];
                        updated.splice(index, 1);
                        setInvoiceFiles({
                          ...invoiceFiles,
                          attachments: updated,
                        });
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
      <motion.div
        variants={itemVariant}
        className="grid md:grid-cols-2 gap-4 justify-items-center"
      >
        {/* Additional Info */}
        <div className="mb-4">
          <label className="flex items-center justify-center gap-3 px-4 border-2 border-dashed border-black rounded-lg cursor-pointer hover:bg-gray-50 w-64 h-10">
            <Info size={18} className="text-gray-500" />
            <span className="text-sm text-gray-600 text-center">
              Additional Information
            </span>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) =>
                handleFileChange("additionalInfo", e.target.files ?? null)
              }
            />
          </label>

          {invoiceFiles.additionalInfo.length > 0 && (
            <div className="mt-1 text-sm text-gray-700 w-64">
              {invoiceFiles.additionalInfo.map((file, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-gray-100 px-2 py-1 rounded mb-1"
                >
                  <span>{file.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...invoiceFiles.additionalInfo];
                      updated.splice(index, 1);
                      setInvoiceFiles({
                        ...invoiceFiles,
                        additionalInfo: updated,
                      });
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
          <label className="flex items-center justify-center gap-3 px-4 border-2 border-dashed border-black rounded-lg cursor-pointer hover:bg-gray-50 w-64 h-10">
            <Phone size={18} className="text-gray-500" />
            <span className="text-sm text-gray-600 text-center">
              Contact Details
            </span>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) =>
                handleFileChange("contactDetails", e.target.files ?? null)
              }
            />
          </label>

          {invoiceFiles.contactDetails.length > 0 && (
            <div className="mt-1 text-sm text-gray-700 w-64">
              {invoiceFiles.contactDetails.map((file, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-gray-100 px-2 py-1 rounded mb-1"
                >
                  <span>{file.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...invoiceFiles.contactDetails];
                      updated.splice(index, 1);
                      setInvoiceFiles({
                        ...invoiceFiles,
                        contactDetails: updated,
                      });
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
      <motion.div
        variants={itemVariant}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 m-4"
      >
        <button
          disabled={saving}
          onClick={saveInvoice}
          className={`bg-green-300 text-black px-6 py-2 h-12 w-64 sm:w-auto rounded flex items-center justify-center gap-2 ${saving ? "bg-gray-400 cursor-not-allowed" : ""}`}
        >
          <Edit2 size={16} />
          {saving ? "Saving..." : "Save Invoice"}
        </button>

        <button
          className="bg-blue-300 text-black px-6 py-2 h-12 w-64 sm:w-auto rounded flex items-center justify-center gap-2 "
          onClick={async () => {
            if (editMode) await saveInvoice();
            setEditMode(!editMode);
          }}
        >
          <Edit2 size={16} />
          {editMode ? "Finish Edit" : "Edit Invoice"}
        </button>

        <button
          className="bg-white text-black px-6 py-2 h-12 w-64 sm:w-auto rounded flex items-center justify-center gap-2"
          onClick={() => setShowEmailForm(!showEmailForm)}
        >
          <Send size={16} />
          Send Invoice
        </button>
      </motion.div>

      {showEmailForm && (
        <div className="flex justify-center gap-2 mb-6">
          <input
            type="email"
            placeholder="Enter recipient email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 border-black rounded"
          />
          <button
            disabled={sending}
            className={`px-4 py-2 rounded text-white 
    ${sending ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500"}`}
            onClick={() =>
              runWithOverlay(async () => {
                await sendInvoice();
              })
            }
          >
            {sending ? "Sending..." : "Send PDF"}
          </button>
        </div>
      )}

      {successMsg && (
        <p className="text-green-600 text-center font-medium mt-2">
          {successMsg}
        </p>
      )}

      <motion.div variants={itemVariant} className="flex justify-center mb-6">
        <button
          className={`bg-indigo-400 text-black px-6 py-2 h-12 w-64 rounded flex items-center justify-center gap-2 ${downloading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-300"}`}
          disabled={downloading}
          onClick={() => {
            if (editMode) {
              setPopup({
                open: true,
                message: "Please finish edit to download the PDF",
                type: "error",
              });
              return;
            }

            runWithOverlay(async () => {
              await generatePDF();
            });
          }}
        >
          <Download size={16} />
          {downloading ? "Downloading PDF" : "Download PDF"}
        </button>
      </motion.div>

      {popup.open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl px-8 py-6 shadow-xl w-[320px] text-center animate-scaleIn">
            <h3
              className={`text-lg font-semibold mb-3 ${
                popup.type === "success"
                  ? "text-green-600"
                  : popup.type === "error"
                    ? "text-red-600"
                    : "text-gray-700"
              }`}
            >
              {popup.type === "success"
                ? "Success"
                : popup.type === "error"
                  ? "Error"
                  : "Info"}
            </h3>

            <p className="text-gray-700 mb-5">{popup.message}</p>

            <button
              onClick={() => setPopup({ ...popup, open: false })}
              className="px-5 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const MenuItem = ({ icon, label, isActive, onClick }: any) => (
  <div
    onClick={onClick}
    className={`
       px-3 py-2 rounded-xl flex gap-2 items-center cursor-pointer whitespace-nowrap
      transition
      ${isActive ? "text-black bg-white/30" : "text-black hover:bg-white/20"}
    `}
  >
    {icon}
    <span>{label}</span>
  </div>
);

export default InvoicePreview;
