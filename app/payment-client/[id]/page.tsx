"use client";
import { authFetch} from "@/utils/authFetch"; 
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Download } from "lucide-react";

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
        phone?: string;
        gstin?: string;
        address?: string;
        city?: string;
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
    const { id } = useParams();
    const invoiceRef = useRef<HTMLDivElement>(null);
    const [user, setUser] = useState<{ username: string; email: string } | null>(null);
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState("Payments");
    const [paymentMethod, setPaymentMethod] = useState("UPI"); // default method


    const menuItems = [
        { icon: <FaFileInvoiceDollar />, label: "Dashboard", path: "/dashboard-client" },
        { icon: <FaUsers />, label: "My Invoices", path: "/myInvoices" },
        { icon: <FaChartBar />, label: "Payments", path: "/payment-client" },
        { icon: <FaMoneyCheckAlt />, label: "Profile", path: "/profile" },
        { icon: <FaCog />, label: "Help", path: "/help" },
    ];

    // ---------------- AUTH + FETCH ----------------
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            router.replace("/login");
            return;
        }
        setUser(JSON.parse(storedUser));

        const fetchInvoice = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await authFetch(`/api/auth/invoice/${id}`, {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                });

                if (!res.ok) throw new Error("Invoice fetch failed");

                const data = await res.json();

                // Check API success
                if (!data.success || !data.invoice) {
                    throw new Error(data.error || "Invoice fetch failed");
                }

                // Set invoice correctly
                setInvoice(data.invoice);
            } catch (err: any) {
                console.error("Failed to fetch invoice:", err);
                setError(err.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        fetchInvoice();
    }, [id, router]);


    const handleLogout = async () => {
        try {
            await authFetch("/api/auth/logout", { method: "POST" });
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            router.push("/");
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    // ---------------- RENDER ----------------
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">Loading invoice...</div>
        );
    }

    if (error || !invoice) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-600">
                {error || "Invoice not found."}
            </div>
        );
    }
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

    return (
        <div className="min-h-screen bg-gray-200 p-6  justify-center">
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

            <div className="w-full  bg-white rounded-xl shadow-lg pb-10">


                {/* HEADER */}


                {/* INVOICE TITLE */}
                <div ref={invoiceRef} className="w-full mt-8 p-6 rounded shadow">


                    <div className="px-8 py-4 text-2xl mt-10 font-semibold">
                        Invoice - {invoice.invoiceNumber}
                    </div>

                    {/* CLIENT INFO */}
                    {/* CLIENT INFO */}
                    {invoice.billedTo ? (
                        <div className="px-8 py-6">
                            <h2 className="text-xl font-semibold">{invoice.billedTo.businessName}</h2>
                            <p >{invoice.billedTo.email}</p>
                            {invoice.billedTo.phone && <p>Phone: {invoice.billedTo.phone}</p>}
                            {invoice.billedTo.gstin && <p>GSTIN: {invoice.billedTo.gstin}</p>}
                            {invoice.billedTo.address && <p>Address: {invoice.billedTo.address}</p>}
                            {invoice.billedTo.city && <p>City: {invoice.billedTo.city}</p>}
                        </div>
                    ) : (
                        <div className="px-8 py-6 text-red-600">
                            Client information not available.
                        </div>
                    )}

                    {/* DETAILS */}


                    {/* ITEMS TABLE */}
                    {/* DETAILS */}
                    {invoice.billedBy ? (
                        <div className="mx-8 border p-6 grid md:grid-cols-2 gap-6 text-sm">
                            <div>
                                <h3 className="font-semibold mb-2">{invoice.billedBy.businessName}</h3>
                                <p>Email: {invoice.billedBy.email}</p>
                                <p>Phone: {invoice.billedBy.phone}</p>
                                {invoice.billedBy.gstin && <p>GSTIN: {invoice.billedBy.gstin}</p>}
                                {invoice.billedBy.address && <p>Address: {invoice.billedBy.address}</p>}
                                {invoice.billedBy.city && <p>City: {invoice.billedBy.city}</p>}
                            </div>
                            <div>
                                <p><b>Invoice Date:</b> {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                                <p><b>Due Date:</b> {new Date(invoice.dueDate).toLocaleDateString()}</p>
                                {/* <p><b>Status:</b> {invoice.status}</p> */}
                            </div>
                        </div>
                    ) : (
                        <div className="mx-8 border p-6 text-red-600">Invoice issuer information not available.</div>
                    )}

                    {/* ITEMS TABLE */}
                    {invoice.items && invoice.totals ? (
                        <div className="px-8 pt-8">
                            <table className="w-full border-collapse border text-sm">
                                <thead >
                                    <tr>
                                        <th className="border px-4 py-2 text-left">Product</th>
                                        <th className="border px-4 py-2">Rate</th>
                                        <th className="border px-4 py-2">GST</th>
                                        <th className="border px-4 py-2">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.items.map((item, idx) => {
                                        const amount = (item.rate || 0) * (item.qty || 1);
                                        const gst = (amount * (item.gst || 0)) / 100;
                                        return (
                                            <tr key={idx}>
                                                <td className="border px-4 py-2">{item.itemName}</td>
                                                <td className="border px-4 py-2">₹{item.rate}</td>
                                                <td className="border px-4 py-2">₹{gst}</td>
                                                <td className="border px-4 py-2">₹{amount + gst}</td>
                                            </tr>
                                        );
                                    })}

                                    <tr className="font-semibold">
                                        <td colSpan={3} className="border px-4 py-3 text-right">Grand Total</td>
                                        <td className="border px-4 py-3">₹{invoice.totals.grandTotal}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="px-8 pt-8 text-red-600">Invoice items or totals not available.</div>
                    )}

                </div>
                {/* PAYMENT METHOD SELECTION */}
                <div className="px-10 mt-4">
                    <label className="block mb-2 font-medium">Select Payment Method:</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="UPI"
                                checked={paymentMethod === "UPI"}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="form-radio"
                            />
                            UPI
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="CARD"
                                checked={paymentMethod === "CARD"}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="form-radio"
                            />
                            Credit/Debit Card
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="NETBANKING"
                                checked={paymentMethod === "NETBANKING"}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="form-radio"
                            />
                            Net Banking
                        </label>
                    </div>
                </div>

                {/* PAY BUTTON */}
                <div className="px-10 mt-4 flex justify-end">
                    <Link href={`/payment-client/${invoice._id}/pay?method=${paymentMethod}`}>
                        <button className="px-3 py-2 bg-gray-300 hover:bg-green-700 text-black rounded font-semibold">
                            Pay Now
                        </button>
                    </Link>

                </div>
                <div className="flex justify-center mb-6">
                    <button className="bg-gray-300 text-black px-6 py-2 rounded flex items-center gap-2 cursor-pointer" onClick={generatePDF}><Download size={16} /> Download PDF</button>
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
