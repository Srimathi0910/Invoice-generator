"use client";
import { authFetch } from "@/utils/authFetch";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaFileInvoiceDollar, FaUsers, FaChartBar, FaMoneyCheckAlt, FaCog,
  FaUserCircle, FaSearch, FaBars, FaTimes
} from "react-icons/fa";
import { motion, Variants } from "framer-motion";
import TetrominosLoader from "../_components/TetrominosLoader";

const Dashboard = () => {
  const router = useRouter();

  /* ---------------- AUTH ---------------- */
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showLoader, setShowLoader] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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
      .then((data) => {
        console.log("Fetched invoices:", data);

        if (Array.isArray(data)) {
          setInvoices(data);
        } else if (Array.isArray(data.invoices)) {
          setInvoices(data.invoices);
        } else {
          setInvoices([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch invoices", err);
        setInvoices([]);
      });
  }, [user]);


  /* ---------------- CALCULATIONS ---------------- */

  /* ---------------- UI STATE ---------------- */
  const [activeTab, setActiveTab] = useState("All");
  const [activeMenu, setActiveMenu] = useState("Payments");
  const [menuOpen, setMenuOpen] = useState(false);
  const tabs = ["All", "Paid", "Unpaid", "Overdue"];

  const menuItems = [
    { icon: <FaFileInvoiceDollar />, label: "Dashboard", path: "/dashboard-client" },
    { icon: <FaUsers />, label: "My Invoices", path: "/myInvoices" },
    { icon: <FaChartBar />, label: "Payments", path: "/payment-client" },
    { icon: <FaMoneyCheckAlt />, label: "Profile", path: "/profile" },
    { icon: <FaCog />, label: "Help", path: "/help" },
  ];

  const filteredInvoices = invoices.filter((inv) => {
    const matchesTab = activeTab === "All" ? true : inv.status === activeTab;
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.billedTo.businessName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
  const staggerContainer: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };
  const itemVariant: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible" className="min-h-screen bg-[#D9D9D9] p-4 md:p-6">

      {/* ---------------- TOP MENU ---------------- */}
      <motion.div
        variants={navbarVariants}
        initial="hidden"
        animate="visible" className="bg-white rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 shadow">
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


      {/* ---------------- RECENT INVOICES ---------------- */}
      <h2 className="text-xl font-semibold pl-2 pt-14 mb-4">Recent Invoices</h2>
      <motion.div variants={itemVariant} className="bg-white rounded-lg p-4 md:p-6 shadow overflow-x-auto">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-4">
          <div className="relative w-full md:w-1/3">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // reset to first page when searching
              }}
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

        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed border border-gray-200 text-left">
  <thead className="bg-gray-100 hidden md:table-header-group">
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
    {paginatedInvoices.length === 0 ? (
      <tr>
        <td colSpan={6} className="text-center py-6 text-gray-500">
          No invoices found
        </td>
      </tr>
    ) : (
      paginatedInvoices.map((inv) => (
        <tr
          key={inv._id}
          className="border-t md:table-row block md:table-row mb-4 md:mb-0"
        >
          {/* Mobile Card */}
          <td colSpan={6} className="block md:hidden p-2">
            <div className="flex flex-col gap-2 bg-gray-50 rounded p-4 shadow-sm">
              <div className="flex justify-between w-full">
                <span className="font-semibold">Invoice:</span>
                <span>{inv.invoiceNumber}</span>
              </div>
              <div className="flex justify-between w-full">
                <span className="font-semibold">Billed To:</span>
                <span>{inv.billedTo.businessName}</span>
              </div>
              <div className="flex justify-between w-full">
                <span className="font-semibold">Amount:</span>
                <span>₹{inv.totals?.grandTotal ?? 0}</span>
              </div>
              <div className="flex justify-between w-full">
                <span className="font-semibold">Status:</span>
                <span
                  className={`px-2 py-1 rounded text-white ${getStatusColor(
                    inv.status
                  )}`}
                >
                  {inv.status ?? "Unpaid"}
                </span>
              </div>
              <div className="flex justify-between w-full">
                <span className="font-semibold">Date:</span>
                <span>{new Date(inv.invoiceDate).toLocaleDateString()}</span>
              </div>
              {(inv.status === "Unpaid" || inv.status === "Overdue") && (
                <button
                  onClick={() => router.push(`/payment-client/${inv._id}`)}
                  className="bg-blue-200 text-blue-700 font-medium px-3 py-1 rounded hover:bg-blue-300 mt-2"
                >
                  Pay
                </button>
              )}
            </div>
          </td>

          {/* Desktop Table */}
          <td className="hidden md:table-cell px-4 py-2">{inv.invoiceNumber}</td>
          <td className="hidden md:table-cell px-4 py-2">
            {inv.billedTo.businessName}
          </td>
          <td className="hidden md:table-cell px-4 py-2">
            ₹{inv.totals?.grandTotal ?? 0}
          </td>
          <td className="hidden md:table-cell px-4 py-2">
            <span
              className={`px-2 py-1 rounded text-white ${getStatusColor(
                inv.status
              )}`}
            >
              {inv.status ?? "Unpaid"}
            </span>
          </td>
          <td className="hidden md:table-cell px-4 py-2">
            {new Date(inv.invoiceDate).toLocaleDateString()}
          </td>
          <td className="hidden md:table-cell px-4 py-2">
            {(inv.status === "Unpaid" || inv.status === "Overdue") && (
              <button
                onClick={() => router.push(`/payment-client/${inv._id}`)}
                className="bg-blue-200 text-blue-700 font-medium px-3 py-1 rounded hover:bg-blue-300"
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

        </div>

        <div className="flex justify-center gap-2 mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            &lt;
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded ${currentPage === i + 1 ? "bg-blue-500 text-white" : ""}`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            &gt;
          </button>
        </div>

      </motion.div>

    </motion.div>
  );
};

/* ---------------- COMPONENTS ---------------- */
const MenuItem = ({ icon, label, isActive, onClick }: any) => (
  <div onClick={onClick} className={`flex flex-row gap-2 items-center cursor-pointer whitespace-nowrap ${isActive ? "text-[#8F90DF] underline underline-offset-4 pb-1" : "text-black"}`}>
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
