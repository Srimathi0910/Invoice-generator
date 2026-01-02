"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
} from "recharts";
import { useState, useMemo, useEffect } from "react";

import { Calendar, Download } from "lucide-react";
import { useRouter } from "next/navigation";
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


const monthlyData = [
    { month: "Sep", amount: 120000 },
    { month: "Oct", amount: 100000 },
    { month: "Nov", amount: 150000 },
    { month: "Dec", amount: 225000 },
];
const menuItems = [
    { icon: <FaFileInvoiceDollar />, label: "Invoices", path: "/dashboard" },
    { icon: <FaUsers />, label: "Clients", path: "/clients" },
    { icon: <FaChartBar />, label: "Reports", path: "/reports" },
    { icon: <FaMoneyCheckAlt />, label: "Payments", path: "/payments" },
    { icon: <FaCog />, label: "Settings", path: "/settings" },
  ];

const pieData = [
    { name: "Paid", value: 80, color: "#7C6EF6" },
    { name: "Pending", value: 20, color: "#FF9F7A" },
    { name: "Overdue", value: 20, color: "#33C6DD" },
];

const invoices = [
    { no: "#INV-1001", client: "ABC", amount: "$1,200", status: "Paid", date: "21/12/2025" },
    { no: "#INV-1002", client: "DEF", amount: "$4,200", status: "Unpaid", date: "25/12/2025" },
    { no: "#INV-1003", client: "GHI", amount: "$9,000", status: "Overdue", date: "20/12/2025" },
    { no: "#INV-1004", client: "JKL", amount: "$5,800", status: "Paid", date: "21/12/2025" },
];

export default function ReportsPage() {
    const router = useRouter();

    const [activeMenu, setActiveMenu] = useState("Reports");
    const [user, setUser] = useState<{ username: string } | null>(null);

    const [menuOpen, setMenuOpen] = useState(false);
    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        localStorage.clear();
        router.push("/");
    };
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            router.replace("/login");
        } else {
            setUser(JSON.parse(storedUser));
        }
    }, [router]);
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
                      className={`flex flex-col md:flex-row md:items-center md:space-x-10 w-full md:w-auto ${menuOpen ? "flex" : "hidden md:flex"
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
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Reports</h1>
                <button className="flex items-center gap-2 bg-white px-4 py-2 rounded shadow">
                    <Download size={16} />
                    Export Report
                </button>
            </div>

            {/* Date Filters */}
            <div className="flex gap-6 mb-6">
                <DateBox label="Start Date" value="Dec 21, 2025" />
                <DateBox label="End Date" value="Dec 23, 2025" />
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-6 rounded shadow">
                    <p className="text-sm text-gray-500 mb-2">Total Revenues</p>
                    <h2 className="text-3xl font-bold text-blue-600">₹2,25,000</h2>
                </div>

                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-bold mb-2">Total: 40</h2>
                    <div className="flex gap-6 text-sm">
                        <span className="text-green-600">Paid Invoices: 27</span>
                        <span className="text-orange-500">Pending Invoices: 7</span>
                        <span className="text-red-500">Overdue Invoices: 6</span>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6 mb-10">
                {/* Bar Chart */}
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

                {/* Pie Chart */}
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

            {/* Recent Invoices */}
            <div className="bg-white p-6 rounded shadow">
                <h3 className="text-xl font-bold mb-4">Recent Invoices</h3>

                <table className="w-full border-collapse">
                    <thead className="bg-gray-200 text-left">
                        <tr>
                            <th className="p-3">Invoice Number</th>
                            <th className="p-3">Client</th>
                            <th className="p-3">Amount</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map((inv) => (
                            <tr key={inv.no} className="border-b">
                                <td className="p-3 text-blue-600 font-semibold">{inv.no}</td>
                                <td className="p-3">{inv.client}</td>
                                <td className="p-3 font-bold">{inv.amount}</td>
                                <td className="p-3">
                                    <StatusBadge status={inv.status} />
                                </td>
                                <td className="p-3">{inv.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* ---------- Components ---------- */

function DateBox({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-sm mb-1">{label}</p>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded shadow">
                <Calendar size={16} />
                <span>{value}</span>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        Paid: "bg-green-600",
        Unpaid: "bg-orange-500",
        Overdue: "bg-red-600",
    };

    return (
        <span className={`px-3 py-1 text-white rounded ${styles[status]}`}>
            {status}
        </span>
    );
}
const MenuItem = ({ icon, label, isActive, onClick }: any) => (
  <div
    onClick={onClick}
    className={`flex flex-row gap-2 items-center cursor-pointer whitespace-nowrap ${isActive ? "text-[#8F90DF] underline" : "text-black"
      }`}
  >
    {icon}
    <span>{label}</span>
  </div>
);