"use client";
import { authFetch } from "@/utils/authFetch";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Calendar, Download } from "lucide-react";
import { FaFileInvoiceDollar, FaUsers, FaChartBar, FaSearch, FaMoneyCheckAlt, FaCog, FaUserCircle, FaBars, FaTimes,FaRegUser } from "react-icons/fa";
import { motion, Variants } from "framer-motion";
import TetrominosLoader from "../_components/TetrominosLoader";

export default function ReportsPage() {
    const router = useRouter();
    const [user, setUser] = useState<{ username: string; email?: string } | null>(null);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeMenu, setActiveMenu] = useState("Reports");
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [showLoader, setShowLoader] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);


    useEffect(() => {
        // Show loader for 3 seconds
        const timer = setTimeout(() => {
            setShowLoader(false);
        }, 1200); // 3000ms = 3 seconds

        return () => clearTimeout(timer); // cleanup
    }, []);

    /* ---------------- AUTH ---------------- */
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return router.replace("/login");
        setUser(JSON.parse(storedUser));
    }, [router]);

    /* ---------------- FETCH INVOICES ---------------- */
    useEffect(() => {
        if (!user?.email) return;

        authFetch(`/api/auth/invoice?email=${user.email}`, {
            credentials: "include",
        })
            .then((data) => {
                console.log("Reports invoices response:", data); // 🔍 debug once

                if (Array.isArray(data)) {
                    setInvoices(data);
                } else if (Array.isArray(data.invoices)) {
                    setInvoices(data.invoices);
                } else {
                    setInvoices([]);
                }

                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch invoices:", err);
                setInvoices([]);
                setLoading(false);
            });
    }, [user]);


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
        { icon: <FaFileInvoiceDollar />, label: "Dashboard", path: "/dashboard-client" },
        { icon: <FaUsers />, label: "My Invoices", path: "/myInvoices" },
        { icon: <FaChartBar />, label: "Payments", path: "/payment-client" },
        { icon: <FaMoneyCheckAlt />, label: "Reports", path: "/reports-client" },
            { icon: <FaRegUser />, label: "Profile", path: "/profile" },
        { icon: <FaCog />, label: "Help", path: "/help" },
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
    const navbarVariants: Variants = {
        hidden: { y: -100, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
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
        visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut", delay: 1 } },
    };


    const summaryItemVariants: Variants = {
        hidden: { y: -50, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
    };

    const revenueVariants: Variants = {
        hidden: { y: -50, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut", delay: 0.6 } },
    };
    const staggerContainer: Variants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1,
            },
        },
    }; const itemVariant: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.4, ease: "easeOut" },
        },
    };
    const invoicesPerPage = 5;

    const totalPages = Math.ceil(filteredInvoices.length / invoicesPerPage);

    // Slice invoices for current page
    const paginatedInvoices = filteredInvoices.slice(
        (currentPage - 1) * invoicesPerPage,
        currentPage * invoicesPerPage
    );

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
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
            animate="visible" className="min-h-screen bg-gray-300 p-4 md:p-6">
            <motion.div
                variants={navbarVariants}
                initial="hidden"
                animate="visible" className="glass-strong rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <motion.div variants={itemVariant} className="text-xl font-bold cursor-pointer mb-3 md:mb-0">
                    {/* LOGO */}
                </motion.div>

                <motion.div variants={itemVariant} className="md:hidden flex items-center mb-3">
                    <button onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                    </button>
                </motion.div>

                <motion.div variants={itemVariant}
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
                        <div className="flex items-center space-x-3 glass px-4 py-2 rounded shadow">
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
            <motion.div variants={itemVariant}>
                <h1 className="text-3xl font-bold mb-6">Reports</h1>
            </motion.div>
            {/* Summary Cards */}
            <motion.div variants={itemVariant} className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="glass p-6 rounded shadow">
                    <p className="text-sm text-gray-500 mb-2">Total Revenues</p>
                    <h2 className="text-3xl font-bold text-blue-600">${Number(totalRevenue).toFixed(2)}</h2>
                </div>

                <div className="glass p-6 rounded shadow">
                    <h2 className="text-xl font-bold mb-2">Total: {totalInvoices}</h2>
                    <div className="flex gap-6 text-sm">
                        <span className="text-green-600">Paid Invoices: {paidInvoices}</span>
                        <span className="text-orange-500">Unpaid Invoices: {unpaidInvoices}</span>
                        <span className="text-red-500">Overdue Invoices: {overdueInvoices}</span>
                    </div>
                </div>
            </motion.div>

            {/* Charts */}
            <motion.div variants={itemVariant} className="grid md:grid-cols-2 gap-6 mb-10">
                <div className="glass p-6 rounded shadow">
                    <h3 className="font-bold mb-4">Monthly Revenue</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={monthlyData}>
                            <XAxis stroke="black" dataKey="month" />
                            <YAxis stroke="black"/>
                            <Tooltip />
                            <Bar dataKey="amount" fill="#E5E7EB" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="glass p-6 rounded shadow">
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
            </motion.div>
            <h2 className="text-xl font-semibold pl-2 pt-20 mb-4">Recent Invoices</h2>

            <motion.div variants={itemVariant} className="glass bg-white/20 rounded-lg p-4 md:p-6 shadow overflow-x-auto">
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
                                className={`text-sm font-medium text-[20px] transition pb-1 ${activeTab === tab
                                    ? "text-[#29268E] border-b-2 border-[#29268E]"
                                    : "text-black hover:text-[#29268E]"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="overflow-x-auto w-full">
                    <table className="min-w-full  table-auto text-sm md:text-base min-w-full table-auto text-sm md:text-base">
                        <thead className="bg-gray-100 glass bg-white/20 backdrop-blur">
                            <tr className="hidden md:table-row hidden md:table-row border-t-[10px] border-white/20
"> {/* Hide headers on small screens */}
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
                                paginatedInvoices.map((inv) => (
                                    <InvoiceRow
                                        key={inv._id}
                                        id={inv.invoiceNumber}
                                        client={inv.billedTo.businessName}
                                        amount={`₹${inv.totals?.grandTotal ?? 0}`}
                                        status={(inv.status ?? "N/A").trim()}
                                        date={new Date(inv.invoiceDate).toLocaleDateString()}
                                    />
                                ))

                            )}
                        </tbody>
                    </table>
                    {/* ---------------- PAGINATION CONTROLS ---------------- */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-4 gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                            >
                                &lt;
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-3 py-1 rounded ${page === currentPage ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                            >
                                &gt;
                            </button>
                        </div>
                    )}

                </div>
            </motion.div>
        </motion.div>
    );
}
const MenuItem = ({ icon, label, isActive, onClick }: any) => (
  <div
    onClick={onClick}
    className={`
       px-3 py-2 rounded-xl flex gap-2 items-center cursor-pointer whitespace-nowrap
      transition
      ${isActive
        ? "text-black bg-white/30"
        : "text-black hover:bg-white/20"}
    `}
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
        Paid: "bg-[#05410C]",
        Unpaid: "bg-[#E06A2A]",
        Overdue: "bg-[#E51F22]",
    };

    return (
        <tr className="border-t border-t-[1px] border-white md:table-row block md:table-row mb-4 md:mb-0">
            {/* Mobile layout */}
            <td colSpan={5} className="block md:hidden px-2 py-2">
                <div className="flex flex-col items-center gap-2">
                    {/* Each row: label on left, value on right */}
                    <div className="flex justify-between w-full px-4">
                        <span className="font-semibold">Invoice:</span>
                        <span className="text-left">{id}</span>
                    </div>
                    <div className="flex justify-between w-full px-4">
                        <span className="font-semibold">Client:</span>
                        <span className="text-left">{client}</span>
                    </div>
                    <div className="flex justify-between w-full px-4">
                        <span className="font-semibold">Amount:</span>
                        <span className="text-left">{amount}</span>
                    </div>
                    <div className="flex justify-between w-full px-4">
                        <span className="font-semibold">Status:</span>
                        <span
                            className={`px-2 py-1 text-white rounded ${colors[status] ?? "bg-gray-400"}`}
                        >
                            {status}
                        </span>
                    </div>
                    <div className="flex justify-between w-full px-4">
                        <span className="font-semibold">Date:</span>
                        <span className="text-left">{date}</span>
                    </div>
                </div>
            </td>

            {/* Desktop layout */}
            <td className="hidden md:table-cell px-2 md:px-6 py-1 md:py-4 text-left">{id}</td>
            <td className="hidden md:table-cell px-2 md:px-4 py-1 md:py-2 text-left">{client}</td>
            <td className="hidden md:table-cell px-2 md:px-4 py-1 md:py-2 text-left">{amount}</td>
            <td className="hidden md:table-cell px-2 md:px-4 py-1 md:py-2 text-left">
                <button
                    className={`px-2 py-1 text-white rounded ${colors[status] ?? "bg-gray-400"}`}
                >
                    {status}
                </button>
            </td>
            <td className="hidden md:table-cell px-2 md:px-4 py-1 md:py-2 text-left">{date}</td>
        </tr>
    );
};
