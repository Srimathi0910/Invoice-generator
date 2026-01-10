"use client";

import { useState, useEffect } from "react";
import { authFetch} from "@/utils/authFetch"; // adjust the path based on your project
import TetrominosLoader from "../_components/TetrominosLoader";

import { useRouter } from "next/navigation";
import {
  FaFileInvoiceDollar, FaUsers, FaChartBar, FaMoneyCheckAlt, FaCog,
  FaUserCircle, FaSearch, FaBars, FaTimes
} from "react-icons/fa";
import { motion, Variants } from "framer-motion";

const Dashboard = () => {
  const router = useRouter();

  /* ---------------- AUTH ---------------- */
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
   const [showLoader, setShowLoader] = useState(true);
    useEffect(() => {
      // Show loader for 3 seconds
      const timer = setTimeout(() => {
        setShowLoader(false);
      }, 1200); // 3000ms = 3 seconds
  
      return () => clearTimeout(timer); // cleanup
    }, []);

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


  /* ---------------- INVOICES ---------------- */
  const [invoices, setInvoices] = useState<any[]>([]);

useEffect(() => {
  if (!user?.email) return;

  authFetch(`/api/auth/invoice?email=${user.email}`)
    .then(data => {
      setInvoices(Array.isArray(data) ? data : (data.invoices ?? []));
    })
    .catch(err => console.error("Failed to fetch invoices", err));
}, [user]);



  /* ---------------- CALCULATIONS ---------------- */
  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter(i => i.status === "Paid").length;
  const unpaidInvoices = invoices.filter(i => i.status === "Unpaid").length;
  const overdueInvoices = invoices.filter(i => i.status === "Overdue").length;

  const totalRevenue = invoices
    .filter(i => i.status === "Paid")
    .reduce((sum, i) => sum + Number(i.totals?.grandTotal ?? 0), 0);

  /* ---------------- UI STATE ---------------- */
  const [activeTab, setActiveTab] = useState("All");
  const [activeMenu, setActiveMenu] = useState("Dashboard");
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

    if (showLoader) {
    return (
      <div className="relative w-full h-screen flex items-center justify-center bg-gray-50">
        <TetrominosLoader />
      </div>
    );
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

  return (
    <div className="min-h-screen bg-[#D9D9D9] p-4 md:p-6">

      {/* ---------------- TOP MENU ---------------- */}
      <motion.div variants={navbarVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 shadow">
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
      </motion.div>

      {/* ---------------- SUMMARY ---------------- */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12 auto-rows-[120px]" variants={summaryContainerVariants}
        initial="hidden"
        animate="visible">
        <motion.div variants={summaryItemVariants}>
          <SummaryBox title="Total Invoices" value={totalInvoices} bg="#29268E" innerBg="#2326AF" />
        </motion.div>
        <motion.div variants={summaryItemVariants}>
          <SummaryBox title="Paid Invoices" value={paidInvoices} bg="#05410C" innerBg="#086212" />
        </motion.div>
        <motion.div variants={summaryItemVariants}>
          <SummaryBox title="Unpaid Invoices" value={unpaidInvoices} bg="#E06A2A" innerBg="#F87731" />
        </motion.div>
        <motion.div variants={summaryItemVariants}>
          <SummaryBox title="Overdue Invoices" value={overdueInvoices} bg="#E51F22" innerBg="#F91A1E" />
        </motion.div>
        <motion.div variants={revenueVariants}>
          <div className="bg-white text-black rounded shadow p-4 flex flex-col min-h-[200px]">
            <span className="text-sm text-center text-[20px] font-medium">Total Revenue</span>
            <hr className="border-gray-300 my-2" />
            <div className="text-center text-xl font-semibold mb-3">₹{totalRevenue.toFixed(2)}</div>
          </div>
        </motion.div>

      </motion.div>

      {/* ---------------- RECENT INVOICES ---------------- */}
      <h2 className="text-xl font-semibold pl-2 pt-20 mb-4">Recent Invoices</h2>
      <motion.div
        variants={recentInvoicesVariants}
        initial="hidden"
        animate="visible" className="bg-white rounded-lg p-4 md:p-6 shadow overflow-x-auto">
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
                className={`text-sm font-medium text-[20px] transition pb-1 ${activeTab === tab ? "text-[#29268E] border-b-2 border-[#29268E]" : "text-black hover:text-[#29268E]"}`
                }
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <table className="min-w-full table-fixed border border-gray-200 text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 w-1/6">Invoice</th>
              <th className="px-4 py-2 w-1/6">Billed To</th>
              <th className="px-4 py-2 w-1/6">Amount</th>
              <th className="px-4 py-2 w-1/6">Status</th>
              <th className="px-4 py-2 w-1/6">Date</th>
              <th className="px-4 py-2 w-1/6">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
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
                    {(inv.status === "Unpaid" || inv.status === "Overdue") && (
                      <button
                        onClick={() => router.push(`/payment-client/${inv._id}`)}
                        className="px-3 py-1 bg-gray-300 hover:bg-gray-400 rounded font-medium"
                      >
                        Pay
                      </button>
                    )}
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
    </motion.div>

    </div >
  );
};

/* ---------------- COMPONENTS ---------------- */
const MenuItem = ({ icon, label, isActive, onClick }: any) => (
  <div onClick={onClick} className={`flex flex-row gap-2 items-center cursor-pointer whitespace-nowrap ${isActive ? "text-[#8F90DF] underline" : "text-black"}`}>
    {icon}
    <span>{label}</span>
  </div>
);

const SummaryBox = ({ title, value, bg, innerBg }: any) => (
  <div className="text-white rounded shadow flex flex-col justify-between" style={{ backgroundColor: bg }}>
    <span className="text-sm text-center pt-3">{title}</span>
    <div className="w-full text-center py-4 font-semibold text-lg" style={{ backgroundColor: innerBg }}>{value}</div>
  </div>
);

export default Dashboard;
