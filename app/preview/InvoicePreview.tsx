"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Edit2, Download, Send } from "lucide-react";
import jsPDF from "jspdf";
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

const InvoicePreview = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; email?: string } | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.replace("/login");
    } else {
      setUser(JSON.parse(storedUser));
    }
    setLoadingUser(false);
  }, [router]);

  const [invoice, setInvoice] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
   const [activeMenu, setActiveMenu] = useState("Invoices");


  /* ---------------- LOAD INVOICE ---------------- */
  useEffect(() => {
  const dataFromStorage = localStorage.getItem("invoiceData");
  if (dataFromStorage) {
    const parsed = JSON.parse(dataFromStorage);
    setInvoice(parsed); // must include parsed._id
    return;
  }

  const data = searchParams.get("data");
  if (data) {
    const parsed = JSON.parse(data);
    setInvoice(parsed); // must include parsed._id if it exists
  }
}, [searchParams]);


  /* ---------------- TOTALS (SAFE) ---------------- */
  const totals = useMemo(() => {
    if (!invoice) {
      return { amount: 0, cgst: 0, sgst: 0, totalQty: 0, grandTotal: 0 };
    }

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

  const totalInWords = `${totals.grandTotal} rupees only`;

  /* ---------------- SAVE ---------------- */
const saveInvoice = async () => {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return alert("Please login");

  const user = JSON.parse(storedUser);
  if (!invoice) return alert("Invoice not loaded");

  const invoiceToSave = {
    ...invoice, // include _id if it exists
    totals,
    totalInWords,
    userId: user._id,
    extras: {
      discount: invoice.extras?.discount || 0,
      charges: invoice.extras?.charges || 0,
    },
  };

  try {
    const res = await fetch("/api/auth/invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invoiceToSave),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error || "Save failed");

    alert("Invoice updated successfully!");
    localStorage.setItem("invoiceData", JSON.stringify(data.invoice));
    setInvoice(data.invoice); // update state
  } catch (err) {
    console.error(err);
    alert("Network error. Invoice not saved.");
  }
};






  /* ---------------- PDF ---------------- */
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text(`Invoice #${invoice.invoiceMeta.invoiceNumber}`, 10, 10);
    doc.text(`Billed To: ${invoice.billedTo.businessName}`, 10, 20);

    let y = 30;
    invoice.items.forEach((item: any, i: number) => {
      doc.text(
        `${i + 1}. ${item.itemName} | Qty: ${item.qty} | Rate: ₹${item.rate} | Amount: ₹${item.qty * item.rate}`,
        10,
        y
      );
      y += 10;
    });

    doc.text(`Amount: ₹${totals.amount.toFixed(2)}`, 10, y + 10);
    doc.text(`CGST: ₹${totals.cgst.toFixed(2)}`, 10, y + 20);
    doc.text(`SGST: ₹${totals.sgst.toFixed(2)}`, 10, y + 30);
    doc.text(`Grand Total: ₹${totals.grandTotal.toFixed(2)}`, 10, y + 40);
    doc.text(`Total in words: ${totalInWords}`, 10, y + 50);

    return doc;
  };

  /* ---------------- SEND ---------------- */
  const sendInvoice = async () => {
    if (!email) return alert("Enter recipient email");
    const pdfData = generatePDF().output("datauristring");

    const res = await fetch("/api/send-invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, pdfData }),
    });

    const data = await res.json();
    data.success ? alert("Invoice sent") : alert("Send failed");
  };

  /* ---------------- ITEMS ---------------- */
  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...invoice.items];
    updatedItems[index][field] =
      field === "itemName" || field === "hsn" ? value : Number(value);
    setInvoice({ ...invoice, items: updatedItems });
  };

  const addNewItem = () =>
    setInvoice({
      ...invoice,
      items: [...invoice.items, { itemName: "", hsn: "", gst: 0, qty: 1, rate: 0 }],
    });

  const removeItem = (index: number) =>
    setInvoice({
      ...invoice,
      items: invoice.items.filter((_: any, i: number) => i !== index),
    });

  /* ---------------- RENDER ---------------- */
  if (!invoice) return <div>Loading...</div>;

 const menuItems = [
    { icon: <FaFileInvoiceDollar />, label: "Invoices", path: "/invoices" },
    { icon: <FaUsers />, label: "Clients", path: "/clients" },
    { icon: <FaChartBar />, label: "Reports", path: "/reports" },
    { icon: <FaMoneyCheckAlt />, label: "Payments", path: "/payments" },
    { icon: <FaCog />, label: "Settings", path: "/settings" },
  ];
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
                className={`flex flex-col md:flex-row md:items-center md:space-x-10 w-full md:w-auto ${
                  menuOpen ? "flex" : "hidden md:flex"
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
      <div className="max-w-5xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Invoice Preview</h1>

        {/* Header */}
        <div className="flex justify-between mb-6">
          <div>
            <h2 className="font-bold">{invoice.billedBy.businessName || "Your Business"}</h2>
            <p>{invoice.billedBy.address}, {invoice.billedBy.city}</p>
            <p>{invoice.billedBy.country}</p>
            <p>Phone: {invoice.billedBy.phone}</p>
            <p>GSTIN: {invoice.billedBy.gstin}</p>
          </div>

          <div className="text-right">
            <p>Invoice #: {invoice.invoiceMeta?.invoiceNumber || "N/A"}</p>
            <p>Date: {invoice.invoiceMeta?.invoiceDate || "N/A"}</p>
            <p>Due: {invoice.invoiceMeta?.dueDate || "N/A"}</p>

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
        <table className="w-full border text-sm mb-2">
          <thead className="bg-gray-200">
            <tr>
              <th className="border px-2">Item</th>
              <th className="border px-2">HSN</th>
              <th className="border px-2">GST%</th>
              <th className="border px-2">Qty</th>
              <th className="border px-2">Rate</th>
              <th className="border px-2">Amount</th>
              {editMode && <th className="border px-2">Action</th>}
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item: any, i: number) => {
              const amount = item.qty * item.rate;
              return (
                <tr key={i} className="text-center relative">
                  <td className="border px-2">{editMode ? <input value={item.itemName} onChange={(e) => handleItemChange(i, "itemName", e.target.value)} /> : item.itemName}</td>
                  <td className="border px-2">{editMode ? <input value={item.hsn} onChange={(e) => handleItemChange(i, "hsn", e.target.value)} /> : item.hsn}</td>
                  <td className="border px-2">{editMode ? <input type="number" value={item.gst} onChange={(e) => handleItemChange(i, "gst", e.target.value)} /> : item.gst}</td>
                  <td className="border px-2">{editMode ? <input type="number" value={item.qty} onChange={(e) => handleItemChange(i, "qty", e.target.value)} /> : item.qty}</td>
                  <td className="border px-2">{editMode ? <input type="number" value={item.rate} onChange={(e) => handleItemChange(i, "rate", e.target.value)} /> : item.rate}</td>
                  <td className="border px-2">₹{amount.toFixed(2)}</td>
                  {editMode && <td className="border px-2"><button className="text-red-500 font-bold" onClick={() => removeItem(i)}>✕</button></td>}
                </tr>
              );
            })}
          </tbody>
        </table>

        {editMode && <div className="flex justify-end mb-4">
          <button className="btn bg-green-500 text-white px-4 py-2 rounded" onClick={addNewItem}>+ Add Item</button>
        </div>}

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


        {/* Buttons */}
        <div className="flex justify-center gap-4 mb-4">
          <button className="btn bg-[#D9D9D9] rounded-lg px-4 py-2 flex items-center gap-2" onClick={saveInvoice}><Edit2 size={16} /> Save Invoice</button>
          <button
  className="btn bg-[#D9D9D9] rounded-lg px-4 py-2 flex items-center gap-2"
  onClick={async () => {
    if (editMode) {
      // User clicked "Finish Edit", save the updated invoice
      await saveInvoice();
    }
    setEditMode(!editMode);
  }}
>
  <Edit2 size={16} /> {editMode ? "Finish Edit" : "Edit Invoice"}
</button>

          <button className="btn bg-[#D9D9D9] rounded-lg px-4 py-2 flex items-center gap-2" onClick={() => setShowEmailForm(!showEmailForm)}><Send size={16} /> Send Invoice</button>
        </div>

        {showEmailForm && <div className="flex justify-center gap-2 mb-6">
          <input type="email" placeholder="Enter recipient email" value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 rounded" />
          <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={sendInvoice}>Send PDF</button>
        </div>}

        <div className="flex flex-row justify-center">
          <button className="bg-gray-300 text-black px-6 py-2 rounded flex items-center gap-2" onClick={() => generatePDF().save(`Invoice-${invoice.invoiceMeta.invoiceNumber}.pdf`)}>
            <Download size={16} /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};
const MenuItem = ({ icon, label, isActive, onClick }: any) => (
  <div
    onClick={onClick}
    className={`flex flex-row gap-2 items-center cursor-pointer whitespace-nowrap ${
      isActive ? "text-[#8F90DF] underline" : "text-black"
    }`}
  >
    {icon}
    <span>{label}</span>
  </div>
);
export default InvoicePreview;
