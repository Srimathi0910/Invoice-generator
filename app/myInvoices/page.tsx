"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    FaFileInvoiceDollar, FaUsers, FaChartBar, FaMoneyCheckAlt, FaCog,
    FaUserCircle, FaSearch, FaBars, FaTimes
} from "react-icons/fa";

const Dashboard = () => {
    const router = useRouter();

    /* ---------------- AUTH ---------------- */
    const [user, setUser] = useState<{ username: string; email: string } | null>(null);
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

    /* ---------------- INVOICES ---------------- */
    const [invoices, setInvoices] = useState<any[]>([]);

    useEffect(() => {
        if (!user?.email) return;

        fetch(`/api/auth/invoice?email=${user.email}`)
            .then(res => res.json())
            .then(data => {
                console.log("Fetched invoices:", data); // Check console
                setInvoices(data);
            })
            .catch(err => console.error("Failed to fetch invoices", err));
    }, [user]);

    /* ---------------- CALCULATIONS ---------------- */


    /* ---------------- UI STATE ---------------- */
    const [activeTab, setActiveTab] = useState("All");
    const [activeMenu, setActiveMenu] = useState("My Invoices");
    const [menuOpen, setMenuOpen] = useState(false);
    const tabs = ["All", "Paid", "Unpaid", "Overdue"];

    const menuItems = [
        { icon: <FaFileInvoiceDollar />, label: "Dashboard", path: "/dashboard-client" },
        { icon: <FaUsers />, label: "My Invoices", path: "/myInvoices" },
        { icon: <FaChartBar />, label: "Payments", path: "/payment-client" },
        { icon: <FaMoneyCheckAlt />, label: "Profile", path: "/profile" },
        { icon: <FaCog />, label: "Help", path: "/help" },
    ];

    const filteredInvoices = activeTab === "All" ? invoices : invoices.filter(i => i.status === activeTab);

    if (loadingUser) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }
    const getStatusColor = (status: string) => {
        switch (status) {
            case "Paid":
                return "bg-[#05410C]";
            case "Unpaid":
                return "bg-[#E06A2A]";
            case "Overdue":
                return "bg-[#E51F22]";
            default:
                return "bg-gray-400";
        }
    };

    return (
        <div className="min-h-screen bg-[#D9D9D9] p-4 md:p-6">

            {/* ---------------- TOP MENU ---------------- */}
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

            {/* ---------------- SUMMARY ---------------- */}


            {/* ---------------- RECENT INVOICES ---------------- */}
            <h2 className="text-xl font-semibold pl-2 pt-20 mb-4">Mu Invoices</h2>
            <div className="bg-white rounded-lg p-4 md:p-6 shadow overflow-x-auto">
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-4">
                    <div className="relative w-full md:w-1/3">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search invoices..."
                            className="w-full border border-gray-300 rounded pl-10 pr-3 py-2"
                        />
                    </div>

                    <div className="flex flex-wrap gap-4 md:gap-6">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`text-sm font-medium text-[20px] transition pb-1 ${activeTab === tab ? "text-[#29268E] border-b-2 border-[#29268E]" : "text-black hover:text-[#29268E]"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <table className="min-w-full table-fixed border border-gray-200 text-left">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 w-1/5">Invoice</th>
                            <th className="px-4 py-2 w-1/5">Billed To</th>
                            <th className="px-4 py-2 w-1/5">Amount</th>
                            <th className="px-4 py-2 w-1/5">Status</th>
                            <th className="px-4 py-2 w-1/5">Date</th>
                            <td>Actions</td>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInvoices.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-6 text-gray-500">
                                    No invoices created yet
                                </td>
                            </tr>
                        ) : (
                            filteredInvoices.map(inv => (
                                <tr key={inv._id} className="border-t">
                                    <td className="px-4 py-2">{inv.invoiceNumber}</td>
                                    <td className="px-4 py-2">{inv.billedTo.businessName}</td>
                                    <td className="px-4 py-2">₹{inv.totals?.grandTotal ?? 0}</td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-1 rounded text-white ${getStatusColor(inv.status)}`}>
                                            {inv.status ?? "Unpaid"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                                    <td className="px-4 py-2">
                                        <button className="bg-blue-200 text-blue-700 font-medium px-3 py-1 rounded hover:bg-blue-300">
                                            View
                                        </button>
                                    </td>



                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

/* ---------------- COMPONENTS ---------------- */
const MenuItem = ({ icon, label, isActive, onClick }: any) => (
    <div onClick={onClick} className={`flex flex-row gap-2 items-center cursor-pointer whitespace-nowrap ${isActive ? "text-[#8F90DF] underline" : "text-black"}`}>
        {icon}
        <span>{label}</span>
    </div>
);




export default Dashboard;