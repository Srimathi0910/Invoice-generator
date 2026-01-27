"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Download } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { numberToWords } from "@/utils/numberToWords";
import Navbar2 from "../_components/navbar/Navbar2";
import TetrominosLoader from "../_components/TetrominosLoader";
import { authFetch } from "@/utils/authFetch";

const ViewPDF = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const invoiceRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<any>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [showLoader, setShowLoader] = useState(true);
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
  /* ---------------- LOAD USER ---------------- */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      if (pathname !== "/") router.replace("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (!parsedUser?._id) {
      if (pathname !== "/") router.replace("/login");
      return;
    }
    setUser(parsedUser);
  }, [router, pathname]);
useEffect(() => {
  setShowOverlay(false);
}, []);
  /* ---------------- FETCH INVOICE ---------------- */
  useEffect(() => {
    const invoiceNumber = searchParams.get("invoiceNumber");
    if (!invoiceNumber) return;

    const fetchInvoice = async () => {
      try {
        const res = await authFetch(
          `/api/auth/invoice?invoiceNumber=${encodeURIComponent(invoiceNumber)}`,
        );

        if (res && res.invoice) {
          setInvoice(res.invoice);
        } else {
          setPopup({
            open: true,
            message: "Invoice not found",
            type: "error",
          });
        }
      } catch (err) {
        console.error(err);
        setPopup({
          open: true,
          message: "Failed to fetch invoice",
          type: "error",
        });
      } finally {
        setShowLoader(false);
      }
    };

    fetchInvoice();
  }, [searchParams]);

  /* ---------------- TOTALS ---------------- */
  const totals = useMemo(() => {
    if (!invoice) return { amount: 0, cgst: 0, sgst: 0, grandTotal: 0 };
    let amount = 0,
      cgst = 0,
      sgst = 0;

    invoice.items.forEach((item: any) => {
      const rowAmount = item.qty * item.rate;
      const gstHalf = item.gst / 2;
      amount += rowAmount;
      cgst += (rowAmount * gstHalf) / 100;
      sgst += (rowAmount * gstHalf) / 100;
    });

    const grandTotal =
      amount +
      cgst +
      sgst -
      (invoice.extras?.discount || 0) +
      (invoice.extras?.charges || 0);

    return { amount, cgst, sgst, grandTotal };
  }, [invoice]);

  const totalInWords = useMemo(() => {
    if (!totals?.grandTotal) return "Zero rupees only";
    const integerPart = Math.floor(totals.grandTotal);
    const decimalPart = Math.round((totals.grandTotal - integerPart) * 100);
    let words = numberToWords(integerPart) + " Rupees";
    if (decimalPart > 0) words += ` and ${numberToWords(decimalPart)} Paise`;
    return words + " Only";
  }, [totals?.grandTotal]);

  /* ---------------- PDF GENERATION ---------------- */
  const generatePDF = async () => {
    if (!invoiceRef.current) return;

    try {
      setDownloading(true);
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
      });
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
  if (showLoader) {
    return (
      <div className="relative w-full h-screen flex items-center justify-center bg-gray-50">
        <TetrominosLoader />
      </div>
    );
  }
  // Total revenue box appears after summary boxes

  // Recent invoices appear last

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
   const runWithOverlay = async (fn: () => Promise<void> | void) => {
    setShowOverlay(true);
    try {
      await fn();
    } finally {
      setShowOverlay(false);
    }
  };
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
      <Navbar2 user={user} handleLogout={handleLogout} />

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
            <p className="mb-4">
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
                </tr>
              </thead>
              <tbody>
                {invoice?.items.map((item: any, i: number) => (
                  <tr key={i}>
                    <td className="border px-3 py-2">{item.itemName}</td>

                    <td className="border px-3 py-2">{item.hsn}</td>
                    <td className="border px-3 py-2 text-right">{item.gst}</td>
                    <td className="border px-3 py-2 text-right">{item.qty}</td>

                    <td className="border px-3 py-2 text-right">{item.rate}</td>
                    <td className="border px-3 py-2 text-right">
                      ₹{(item.qty * item.rate).toFixed(2)}
                    </td>
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
              </div>
            ))}
          </div>

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

      <motion.div variants={itemVariant} className="flex justify-center mb-6">
        <button
          className={`bg-indigo-500 text-white m-10 px-6 py-2 h-12 w-64 rounded flex items-center justify-center gap-2 ${downloading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-300"}`}
          disabled={downloading}
          onClick={generatePDF}
        >
          <Download size={16} />
          {downloading ? "Downloading PDF" : "Download PDF"}
        </button>
      </motion.div>

      {popup.open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <div className="glass rounded-2xl px-8 py-6 w-[320px] text-center text-black w-[320px] text-center">
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

            <p className="text-white mb-5">{popup.message}</p>

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

export default ViewPDF;
