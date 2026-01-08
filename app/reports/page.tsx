"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Calendar, Download } from "lucide-react";
import { FaFileInvoiceDollar, FaUsers, FaChartBar, FaSearch, FaMoneyCheckAlt, FaCog, FaUserCircle, FaBars, FaTimes } from "react-icons/fa";

export default function ReportsPage() {
    const router = useRouter();
    const [user, setUser] = useState<{ username: string; email?: string } | null>(null);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeMenu, setActiveMenu] = useState("Reports");
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");

    /* ---------------- AUTH ---------------- */
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return router.replace("/login");
        setUser(JSON.parse(storedUser));
    }, [router]);

    /* ---------------- FETCH INVOICES ---------------- */
    useEffect(() => {
        if (!user?.email) return;

        fetch(`/api/auth/invoice?email=${user.email}`, { credentials: "include" })
            .then(res => res.json())
            .then(data => {
                setInvoices(data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [user]);
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
    if (loading) return <p>Loading...</p>;

    /* ---------------- CALCULATIONS ---------------- */
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(i => i.status === "Paid").length;
    const unpaidInvoices = invoices.filter(i => i.status === "Unpaid").length;
    const overdueInvoices = invoices.filter(i => i.status === "Overdue").length;
    const totalRevenue = invoices.filter(i => i.status === "Paid").reduce((sum, i) => sum + Number(i.totals?.grandTotal ?? 0), 0);

    // Monthly Revenue for BarChart
    const monthlyData = invoices.reduce((acc: any[], inv: any) => {
        const month = new Date(inv.invoiceDate).toLocaleString("default", { month: "short" });
        const existing = acc.find(a => a.month === month);
        if (existing) existing.amount += Number(inv.totals?.grandTotal ?? 0);
        else acc.push({ month, amount: Number(inv.totals?.grandTotal ?? 0) });
        return acc;
    }, []);
    const menuItems = [
        { icon: <FaFileInvoiceDollar />, label: "Invoices", path: "/dashboard" },
        { icon: <FaUsers />, label: "Clients", path: "/clients" },
        { icon: <FaChartBar />, label: "Reports", path: "/reports" },
        { icon: <FaMoneyCheckAlt />, label: "Payments", path: "/payments" },
        { icon: <FaCog />, label: "Settings", path: "/settings" },
    ];
    // Pie chart
    const pieData = [
        { name: "Paid", value: paidInvoices, color: "#05410C" },
        { name: "Unpaid", value: unpaidInvoices, color: "#E06A2A" },
        { name: "Overdue", value: overdueInvoices, color: "#E51F22" },
    ];
    const tabs = ["All", "Paid", "Unpaid", "Overdue"];
    const filteredInvoices = invoices.filter((inv) => {
        const statusMatch =
            activeTab === "All" || inv.status?.trim() === activeTab;

        const clientName =
            inv.billedTo?.businessName?.toLowerCase() || "";

        const searchMatch = clientName.includes(searchTerm.toLowerCase());

        return statusMatch && searchMatch;
    });

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-black dark:text-white">
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
            <h1 className="text-3xl font-bold mb-6">Reports</h1>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-6 rounded shadow">
                    <p className="text-sm text-gray-500 mb-2">Total Revenues</p>
                    <h2 className="text-3xl font-bold text-blue-600">₹{totalRevenue}</h2>
                </div>

                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-bold mb-2">Total: {totalInvoices}</h2>
                    <div className="flex gap-6 text-sm">
                        <span className="text-green-600">Paid Invoices: {paidInvoices}</span>
                        <span className="text-orange-500">Unpaid Invoices: {unpaidInvoices}</span>
                        <span className="text-red-500">Overdue Invoices: {overdueInvoices}</span>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6 mb-10">
                <div className="bg-white p-6 rounded shadow">
                    <h3 className="font-bold mb-4">Monthly Revenue</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={monthlyData}>
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="amount" fill="#E5E7EB" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white p-6 rounded shadow">
                    <h3 className="font-bold mb-4">Invoice Status</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={pieData} dataKey="value" innerRadius={60} outerRadius={90}>
                                {pieData.map((entry, index) => (
                                    <Cell key={index} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <h2 className="text-xl font-semibold pl-2 pt-20 mb-4">Recent Invoices</h2>

            <div className="bg-white rounded-lg p-4 md:p-6 shadow overflow-x-auto">
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-4">
                    <div className="relative w-full md:w-1/3">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by client..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border border-gray-300 rounded pl-10 pr-3 py-2"
                        />

                    </div>

                    <div className="flex flex-wrap gap-4 md:gap-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`bg-white dark:bg-gray-900 text-sm font-medium text-[20px] transition pb-1 ${activeTab === tab
                                    ? "text-[#29268E] border-b-2 border-[#29268E]"
                                    : "text-black hover:text-[#29268E]"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <table className="min-w-full border table-auto">
                    <thead className="bg-gray-100 bg-white dark:bg-gray-900">
                        <tr>
                            <Th>Invoice</Th>
                            <Th>Client</Th>
                            <Th>Amount</Th>
                            <Th>Status</Th>
                            <Th>Date</Th>
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
                            filteredInvoices.map((inv) => (
                                <InvoiceRow
                                    key={inv._id}
                                    id={inv.invoiceNumber}
                                    client={inv.billedTo.businessName}
                                    amount={`₹${inv.totals?.grandTotal ?? 0}`}
                                    status={(inv.status ?? "N/A").trim()} // remove spaces
                                    date={new Date(inv.invoiceDate).toLocaleDateString()}
                                />

                            ))
                        )}
                    </tbody>

                </table>
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
const Th = ({ children }: { children: React.ReactNode }) => (
    <th className="px-4 py-2 text-left whitespace-nowrap">{children}</th>
);

const InvoiceRow = ({ id, client, amount, status, date }: any) => {
    const colors: Record<string, string> = {
        Paid: "bg-[#05410C]",       // dark green
        Unpaid: "bg-[#E06A2A]",     // orange
        Overdue: "bg-[#E51F22]",    // red
    };


    return (
        <tr className="border-t">
            <td className="px-4 py-2">{id}</td>
            <td className="px-4 py-2">{client}</td>
            <td className="px-4 py-2">{amount}</td>
            <td className="px-4 py-2">
                <button className={`px-2 py-1 text-white rounded ${colors[status] ?? "bg-gray-400"}`}>
                    {status}
                </button>

            </td>
            <td className="px-4 py-2">{date}</td>
        </tr>
    );
};
