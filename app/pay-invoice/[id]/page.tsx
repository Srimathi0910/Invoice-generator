"use client";
import { authFetch} from "@/utils/authFetch"; 
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { HelpCircle, User } from "lucide-react";
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
    billedBy: { businessName: string; email: string; phone: string; gstin?: string; address?: string; city?: string; };
    billedTo: { businessName: string; email: string; };
    items: InvoiceItem[];
    totals: { amount: number; cgst: number; sgst: number; grandTotal: number; };
    status: string;
    logoUrl?: string;
}
const menuItems = [
    { icon: <FaFileInvoiceDollar />, label: "Dashboard", path: "/dashboard-client" },
    { icon: <FaUsers />, label: "My Invoices", path: "/myInvoices" },
    { icon: <FaChartBar />, label: "Payments", path: "/payment-client" },
    { icon: <FaMoneyCheckAlt />, label: "Profile", path: "/profile" },
    { icon: <FaCog />, label: "Help", path: "/help" },
];

export default function PayInvoicePage() {
    const router = useRouter();
    const { id } = useParams(); // dynamic invoice ID

    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<string>(""); // default selection
    const [activeMenu, setActiveMenu] = useState("Dashboard");
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState<{ username: string; email: string } | null>(null);
    const [invoices, setInvoices] = useState<any[]>([]);

    useEffect(() => {
        if (!id) return router.replace("/");

        const token = localStorage.getItem("token");
        if (!token) return router.replace("/login");

        async function fetchInvoice() {
            try {
                const res = await authFetch(`/api/auth/invoice/${id}`, {
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

    useEffect(() => {
        if (!user?.email) return;

        authFetch(`/api/auth/invoice?email=${user.email}`)
            .then(res => res.json())
            .then(data => setInvoices(data))
            .catch(err => console.error("Failed to fetch invoices", err));
    }, [user]);
    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!invoice) return <div className="min-h-screen flex items-center justify-center">Invoice not found.</div>;

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

    return (
        <div className="min-h-screen bg-gray-200 flex justify-center p-10">
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
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-8">

                {/* Top bar */}
                <div className="flex justify-end items-center mb-6">
                    <div className="flex items-center gap-6 text-gray-700">
                        <div className="flex items-center gap-1 cursor-pointer"><HelpCircle size={16} /> Help</div>
                        <div className="flex items-center gap-1 cursor-pointer"><User size={16} /> John</div>
                    </div>
                </div>

                {/* Header */}
                <h1 className="text-2xl font-bold mb-1">Pay Invoice</h1>
                <h2 className="text-xl font-semibold">{invoice.billedBy.businessName}</h2>
                <p className="text-gray-600 mb-6">{invoice.billedBy.email}</p>

                {/* Invoice Box */}
                <div className="border border-gray-400 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-2 text-sm">
                        <h3 className="font-semibold">{invoice.billedTo.businessName}</h3>
                        <p>Invoice Date: {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                        <p>Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                        <p className="text-lg font-bold">Amount: Rs.{invoice.totals.grandTotal.toLocaleString()}</p>
                        <div className="bg-red-300 text-center py-2 rounded">{`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`}</div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-2 text-sm">
                        <h3 className="font-semibold">Pay Invoice - {invoice.invoiceNumber}</h3>
                        <p className="font-semibold">Select Payment Method</p>

                        <div className="space-y-1">
                            {["UPI", "Credit card/Debit Card", "Net Banking", "Wallet"].map((method) => (
                                <label key={method} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedPayment === method}
                                        onChange={() => setSelectedPayment(method)}
                                    />
                                    {method}
                                </label>
                            ))}
                        </div>

                        <button

                            disabled={paying || invoice.status === "Paid"}
                            className="mt-4 w-full bg-gray-300 hover:bg-gray-400 transition py-3 rounded font-semibold"
                        >
                            {paying ? "Processing..." : invoice.status === "Paid" ? "Paid" : `Pay Now Rs.${invoice.totals.grandTotal.toLocaleString()}`}
                        </button>
                    </div>
                </div>

                {/* Footer Payment Logos */}
                <div className="flex justify-center gap-4 mt-6 text-gray-600 text-sm">
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