"use client";

import { useEffect, useState } from "react";
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

type Payment = {
    _id: string;
    invoiceNumber: string;
    clientName: string;
    paymentDate: string;
    paymentMethod: string;
    paymentStatus: "Paid" | "Unpaid" | "Overdue";
    amount: number;
};

export default function PaymentsPage() {
    const router = useRouter();
    const [user, setUser] = useState<{ username: string; email?: string } | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [editRow, setEditRow] = useState<string | null>(null); // Track which row is editable
    const [activeMenu, setActiveMenu] = useState("Invoices");
    const [menuOpen, setMenuOpen] = useState(false);
    const menuItems = [
        { icon: <FaFileInvoiceDollar />, label: "Invoices", path: "/dashboard" },
        { icon: <FaUsers />, label: "Clients", path: "/clients" },
        { icon: <FaChartBar />, label: "Reports", path: "/reports" },
        { icon: <FaMoneyCheckAlt />, label: "Payments", path: "/payments" },
        { icon: <FaCog />, label: "Settings", path: "/settings" },
    ];
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            router.replace("/login");
        } else {
            setUser(JSON.parse(storedUser));
        }
        setLoadingUser(false);
    }, [router]);
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
    useEffect(() => {
        fetch("/api/auth/payments")
            .then((res) => res.json())
            .then((data) => {
                if (data.success) setPayments(data.payments);
                setLoading(false);
            })
            .catch((err) => console.error(err));
    }, []);

    const totalPayments = payments.reduce((acc, p) => acc + p.amount, 0);

    const handleUpdate = async (id: string, payment: Partial<Payment>) => {
        try {
            const res = await fetch(`/api/auth/invoice/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    paymentDate: payment.paymentDate,
                    paymentMethod: payment.paymentMethod,
                    paymentStatus: payment.paymentStatus,
                }),
            });

            const data = await res.json();
            if (data.success) {
                setPayments((prev) =>
                    prev.map((p) => (p._id === id ? { ...p, ...payment } : p))
                );
            }
        } catch (err) {
            console.error("Update failed:", err);
        }
    };



    if (loading) return <p className="p-6">Loading...</p>;

    return (
        <div className="p-6">
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
            <h1 className="text-2xl font-bold mb-4">Payments</h1>

            <div className="mb-4">
                <button className="bg-white px-4 py-2 rounded shadow">+ Add Payment</button>
            </div>

            <div className="overflow-x-auto bg-white rounded shadow p-4">
                <table className="w-full text-sm border">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="p-2 border">Invoice Number</th>
                            <th className="p-2 border">Client Name</th>
                            <th className="p-2 border">Payment Date</th>
                            <th className="p-2 border">Payment Method</th>
                            <th className="p-2 border">Payment Status</th>
                            <th className="p-2 border">Amount</th>
                            <th className="p-2 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map((p) => {
                            const isEditing = editRow === p._id;
                            return (
                                <tr key={p._id} className="text-center">
                                    <td className="p-2 border">{p.invoiceNumber}</td>
                                    <td className="p-2 border">{p.clientName}</td>

                                    <td className="p-2 border">
                                        {isEditing ? (
                                            <input
                                                type="date"
                                                value={p.paymentDate ? new Date(p.paymentDate).toISOString().split("T")[0] : ""}
                                                className="border px-2 py-1 rounded text-center"
                                                onChange={(e) =>
                                                    setPayments((prev) =>
                                                        prev.map((pay) =>
                                                            pay._id === p._id ? { ...pay, paymentDate: e.target.value } : pay
                                                        )
                                                    )
                                                }
                                            />

                                        ) : (
                                            new Date(p.paymentDate).toLocaleDateString()
                                        )}
                                    </td>

                                    <td className="p-2 border">
                                        {isEditing ? (
                                            <select
                                                value={p.paymentMethod}
                                                className="px-2 py-1 rounded border text-center"
                                                onChange={(e) =>
                                                    setPayments((prev) =>
                                                        prev.map((pay) =>
                                                            pay._id === p._id
                                                                ? { ...pay, paymentMethod: e.target.value }
                                                                : pay
                                                        )
                                                    )
                                                }
                                            >
                                                <option value="UPI">UPI</option>
                                                <option value="Credit/Debit Card">Credit/Debit Card</option>
                                                <option value="Net Banking">Net Banking</option>
                                                <option value="Wallet">Wallet</option>
                                            </select>
                                        ) : (
                                            p.paymentMethod
                                        )}
                                    </td>

                                   


                                    <td className="p-2 border">
                                        {isEditing ? (
                                            <select
                                                value={p.paymentStatus}
                                                className={`px-2 py-1 rounded text-white cursor-pointer ${p.paymentStatus === "Paid"
                                                    ? "bg-green-500"
                                                    : p.paymentStatus === "Unpaid"
                                                        ? "bg-orange-500" // changed from red to orange
                                                        : "bg-red-500" // changed from orange to red
                                                    }`}
                                                onChange={(e) =>
                                                    setPayments((prev) =>
                                                        prev.map((pay) =>
                                                            pay._id === p._id
                                                                ? { ...pay, paymentStatus: e.target.value as "Paid" | "Unpaid" | "Overdue" }
                                                                : pay
                                                        )
                                                    )
                                                }
                                            >
                                                <option value="Paid">Paid</option>
                                                <option value="Unpaid">Unpaid</option>
                                                <option value="Overdue">Overdue</option>
                                            </select>
                                        ) : (
                                            <span
                                                className={`px-2 py-1 rounded text-white ${p.paymentStatus === "Paid"
                                                    ? "bg-green-500"
                                                    : p.paymentStatus === "Unpaid"
                                                        ? "bg-orange-500"
                                                        : "bg-red-500"
                                                    }`}
                                            >
                                                {p.paymentStatus}
                                            </span>

                                        )}
                                    </td>


                                    <td className="p-2 border">Rs.{p.amount.toLocaleString()}</td>

                                    <td className="p-2 border">
                                        {isEditing ? (
                                            <>
                                                <button
                                                    className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                                                    onClick={async () => {
                                                        await handleUpdate(p._id, {
                                                            paymentDate: p.paymentDate,
                                                            paymentMethod: p.paymentMethod,
                                                            paymentStatus: p.paymentStatus,
                                                        });
                                                        setEditRow(null);
                                                    }}

                                                >
                                                    Save
                                                </button>

                                                <button
                                                    className="bg-gray-400 text-white px-2 py-1 rounded"
                                                    onClick={() => setEditRow(null)}
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                className="bg-blue-500 text-white px-2 py-1 rounded"
                                                onClick={() => setEditRow(p._id)}
                                            >
                                                Edit
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                <div className="text-right mt-4 font-semibold">
                    Total Payments: Rs.{totalPayments.toLocaleString()}
                </div>
            </div>
        </div>
    );
}
const MenuItem = ({ icon, label, isActive, onClick }: any) => (
    <div
        onClick={onClick}
        className={`bg-white dark:bg-gray-900 flex flex-row gap-2 items-center cursor-pointer whitespace-nowrap ${isActive ? "text-[#8F90DF] underline" : "text-black"
            }`}
    >
        {icon}
        <span>{label}</span>
    </div>
);