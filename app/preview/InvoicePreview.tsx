"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Edit2, Download, Send } from "lucide-react";
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



  /* ---------------- LOAD USER ---------------- */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.replace("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

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

      // Prepare FormData
      const formData = new FormData();
      // JSON string of invoice data
      formData.append(
        "data",
        JSON.stringify({
          ...invoice,
          totals,
          totalInWords,
          logoUrl:
            typeof logoPreview === "string"
              ? logoPreview
              : "",

          extras: {
            discount: invoice.extras?.discount || 0,
            charges: invoice.extras?.charges || 0,
          },
        })
      );



      // Optional: append logo file if you allow logo change in frontend
      // if (logoFile) formData.append("file", logoFile);

      const res = await fetch("/api/auth/invoice", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Add JWT token
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) return alert(data.error || "Invoice save failed");

      alert("Invoice saved successfully!");
      localStorage.setItem("invoiceData", JSON.stringify(data.invoice));
      setInvoice(data.invoice);
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
      const images = element.getElementsByTagName("img");
      await Promise.all(
        Array.from(images).map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete) resolve();
              else {
                img.onload = () => resolve();
                img.onerror = () => resolve();
              }
            })
        )
      );

      const canvas = await html2canvasModule(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        scrollY: -window.scrollY,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        pdf.addPage();
        position = heightLeft - imgHeight < 0 ? 0 : heightLeft - imgHeight;
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`Invoice-${invoice?.invoiceNumber || "0000"}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Failed to generate PDF. Check console for details.");
    }
  };

  const sendInvoice = async () => {
    if (!email) return alert("Enter recipient email");
    await generatePDF();
    alert("PDF downloaded. Now implement email sending backend.");
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
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (!invoice) return <div>Loading...</div>;

  const menuItems = [
    { icon: <FaFileInvoiceDollar />, label: "Invoices", path: "/dashboard" },
    { icon: <FaUsers />, label: "Clients", path: "/clients" },
    { icon: <FaChartBar />, label: "Reports", path: "/reports" },
    { icon: <FaMoneyCheckAlt />, label: "Payments", path: "/payments" },
    { icon: <FaCog />, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Navbar */}
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

      {/* Invoice Preview */}
      <div ref={invoiceRef} className="max-w-5xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Invoice Preview</h1>

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
            {/* Invoice Logo */}
            {invoice.logoUrl && (
              <img
                src={invoice.logoUrl}
                alt="Company Logo"
                className="h-16 object-contain"
              />
            )}




            <p>Invoice Number: {invoice.invoiceNumber}</p>
            <p>Date: {formatDate(invoice.invoiceDate)}</p>
            <p>Due Date: {formatDate(invoice.dueDate)}</p>
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

      </div>

      {/* Buttons */}
      <div className="flex justify-center gap-4 m-4">
        <button className="btn bg-[#D9D9D9] rounded-lg px-4 py-2 flex items-center gap-2" onClick={saveInvoice}><Edit2 size={16} /> Save Invoice</button>
        <button className="btn bg-[#D9D9D9] rounded-lg px-4 py-2 flex items-center gap-2" onClick={async () => { if (editMode) await saveInvoice(); setEditMode(!editMode); }}><Edit2 size={16} /> {editMode ? "Finish Edit" : "Edit Invoice"}</button>
        <button className="btn bg-[#D9D9D9] rounded-lg px-4 py-2 flex items-center gap-2" onClick={() => setShowEmailForm(!showEmailForm)}><Send size={16} /> Send Invoice</button>
      </div>

      {showEmailForm && (
        <div className="flex justify-center gap-2 mb-6">
          <input type="email" placeholder="Enter recipient email" value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 rounded" />
          <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={sendInvoice}>Send PDF</button>
        </div>
      )}

      <div className="flex justify-center mb-6">
        <button className="bg-gray-300 text-black px-6 py-2 rounded flex items-center gap-2 cursor-pointer" onClick={generatePDF}><Download size={16} /> Download PDF</button>
      </div>
    </div>
  );
};

const MenuItem = ({ icon, label, isActive, onClick }: any) => (
  <div onClick={onClick} className={`flex flex-row gap-2 items-center cursor-pointer whitespace-nowrap ${isActive ? "text-[#8F90DF] underline" : "text-black"}`}>
    {icon}
    <span>{label}</span>
  </div>
);

export default InvoicePreview;
