"use client";

import { useEffect, useState } from "react";
import { HelpCircle, User } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  FaFileInvoiceDollar, FaUsers, FaChartBar, FaMoneyCheckAlt, FaCog,
  FaUserCircle, FaSearch, FaBars, FaTimes
} from "react-icons/fa";
interface InvoiceItem {
    itemName: string;
    hsn?: string;
    gst?: number;
    qty?: number;
    rate?: number;
}

interface Invoice {
    _id: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    billedBy: {
        businessName: string;
        email: string;
        phone: string;
        gstin?: string;
        address?: string;
        city?: string;
    };
    billedTo: {
        businessName: string;
        email: string;
    };
    items: InvoiceItem[];
    totals: {
        amount: number;
        cgst: number;
        sgst: number;
        grandTotal: number;
    };
    status: string;
    logoUrl?: string;
}

export default function InvoicePage() {
    const router = useRouter();
    const { id } = useParams(); // Get invoice ID from URL
    const [user, setUser] = useState<{ username: string; email: string } | null>(null);
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [activeMenu, setActiveMenu] = useState("Dashboard");
      const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        if (!storedUser || !token) {
            router.replace("/login");
            return;
        }
        setUser(JSON.parse(storedUser));

        async function fetchInvoice() {
            try {
                const res = await fetch(`/api/auth/invoice/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data: Invoice = await res.json();
                setInvoice(data);
            } catch (err) {
                console.error("Failed to fetch invoice:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchInvoice();
    }, [id, router]);
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
const menuItems = [
    { icon: <FaFileInvoiceDollar />, label: "Dashboard", path: "/dashboard-client" },
    { icon: <FaUsers />, label: "My Invoices", path: "/myInvoices" },
    { icon: <FaChartBar />, label: "Payments", path: "/payment-client" },
    { icon: <FaMoneyCheckAlt />, label: "Profile", path: "/profile" },
    { icon: <FaCog />, label: "Help", path: "/help" },
  ];

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!invoice) return <div className="min-h-screen flex items-center justify-center">Invoice not found.</div>;

    return (
        <div className="min-h-screen bg-gray-300 flex items-start justify-center p-10">
            <div className="bg-white rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 shadow">
                    <div className="text-xl font-bold cursor-pointer mb-3 md:mb-0">Invoice Dashboard</div>
            
                    <div className="md:hidden flex items-center mb-3">
                      <button onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                      </button>
                    </div>
            
                    <div className={`flex flex-col md:flex-row md:items-center md:space-x-10 w-full md:w-auto ${menuOpen ? "flex" : "hidden md:flex"}`}>
                      {menuItems.map(item => (
                        <MenuItem
                          key={item.label}
                          icon={item.icon}
                          label={item.label}
                          isActive={activeMenu === item.label}
                          onClick={() => {
                            setActiveMenu(item.label);
                            if (item.path) router.push(item.path);
                          }}
                        />
                      ))}
            
                      <div className="flex flex-col items-end space-y-2">
                        <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded shadow">
                          <FaUserCircle size={28} />
                          <span className="font-medium">{user?.username || "User"}</span>
                        </div>
                        <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">Logout</button>
                      </div>
                    </div>
                  </div>
            <div className="w-full max-w-5xl bg-white rounded-xl shadow-2xl pb-10">
                {/* Top Bar */}
                <div className="flex justify-end items-center px-6 py-4">
                    <div className="flex items-center gap-6 text-sm text-gray-700">
                        <div className="flex items-center gap-1 cursor-pointer">
                            <HelpCircle size={16} />
                            <span>Help</span>
                        </div>
                        <div className="flex items-center gap-1 cursor-pointer">
                            <User size={16} />
                            <span>{user?.username || "User"}</span>
                        </div>
                    </div>
                </div>

                {/* Invoice Title */}
                <div className="bg-gray-200 px-8 py-4 text-3xl font-semibold">
                    Invoice - {invoice.invoiceNumber}
                </div>

                {/* Company Info */}
                <div className="px-8 py-6">
                    <h2 className="text-2xl font-semibold">{invoice.billedTo.businessName}</h2>
                    <p className="text-gray-600">{invoice.billedTo.email}</p>
                </div>

                {/* Info Box */}
                <div className="mx-8 border border-gray-400 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-sm leading-6">
                        <h3 className="font-semibold text-lg mb-2">{invoice.billedBy.businessName}</h3>
                        <p>Email: {invoice.billedBy.email}</p>
                        <p>Phone: {invoice.billedBy.phone}</p>
                        {invoice.billedBy.gstin && <p>GSTIN: {invoice.billedBy.gstin}</p>}
                        {invoice.billedBy.address && <p>Address: {invoice.billedBy.address}</p>}
                        {invoice.billedBy.city && <p>City: {invoice.billedBy.city}</p>}
                    </div>

                    <div className="text-sm space-y-2">
                        <p>
                            <span className="font-semibold">Invoice Date:</span>{" "}
                            {new Date(invoice.invoiceDate).toLocaleDateString()}
                        </p>
                        <p>
                            <span className="font-semibold">Due Date:</span>{" "}
                            {new Date(invoice.dueDate).toLocaleDateString()}
                        </p>
                        <p>
                            <span className="font-semibold">Invoice Number:</span>{" "}
                            {invoice.invoiceNumber}
                        </p>
                    </div>
                </div>

                {/* Bill Summary Table */}
                <h3 className="px-8 pt-8 pb-3 text-xl font-semibold">Bill Summary</h3>
                <div className="px-8">
                    <table className="w-full border border-gray-400 border-collapse text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border border-gray-400 px-4 py-2 text-left">Products</th>
                                <th className="border border-gray-400 px-4 py-2 text-left">Price</th>
                                <th className="border border-gray-400 px-4 py-2 text-left">GST</th>
                                <th className="border border-gray-400 px-4 py-2 text-left">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items.map((item, idx) => {
                                const amount = (item.rate || 0) * (item.qty || 1);
                                const gstAmount = (amount * (item.gst || 0)) / 100;
                                return (
                                    <tr key={idx}>
                                        <td className="border border-gray-400 px-4 py-2">{item.itemName}</td>
                                        <td className="border border-gray-400 px-4 py-2">Rs.{item.rate}</td>
                                        <td className="border border-gray-400 px-4 py-2">Rs.{gstAmount}</td>
                                        <td className="border border-gray-400 px-4 py-2">Rs.{amount + gstAmount}</td>
                                    </tr>
                                );
                            })}
                            <tr className="font-semibold text-lg">
                                <td colSpan={3} className="border border-gray-400 px-4 py-3 text-right">
                                    Grand Total
                                </td>
                                <td className="border border-gray-400 px-4 py-3">
                                    Rs.{invoice.totals.grandTotal}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Pay Button */}
                {(invoice.status === "Unpaid" || invoice.status === "Overdue") && (
                    <div className="px-8 pt-8 flex justify-end">
                        <Link href="pay-invoice">
                            <Link href={`/pay-invoice/${invoice._id}`}>
                                <button className="bg-gray-300 hover:bg-gray-400 px-6 py-2 rounded-lg font-medium">
                                    Pay Now
                                </button>
                            </Link>


                        </Link>
                    </div>
                )}

                {/* Footer */}
                <div className="flex justify-center gap-6 pt-8 text-gray-600 text-sm">
                    <span>VISA</span>
                    <span>RuPay</span>
                    <span>UPI</span>
                    <span>Razorpay</span>
                </div>
            </div>
        </div>
    );
}
const MenuItem = ({ icon, label, isActive, onClick }: any) => (
  <div onClick={onClick} className={`flex flex-row gap-2 items-center cursor-pointer whitespace-nowrap ${isActive ? "text-[#8F90DF] underline" : "text-black"}`}>
    {icon}
    <span>{label}</span>
  </div>
);