"use client";
import { authFetch } from "@/utils/authFetch";
import { useState, useEffect } from "react";
import { useRouter,usePathname } from "next/navigation";
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
  FaRegUser,
  FaPhoneAlt,
} from "react-icons/fa";
import { motion, Variants } from "framer-motion";
import TetrominosLoader from "../_components/TetrominosLoader";
import ClientNavbar from "../_components/navbar/Navbar2";
const Dashboard = () => {
  const router = useRouter();
const pathname = usePathname(); // get current path
  /* ---------------- AUTH ---------------- */
  const [user, setUser] = useState<{ username: string; email: string } | null>(
    null,
  );
  const [loadingUser, setLoadingUser] = useState(true);
  const [showLoader, setShowLoader] = useState(true);
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
    if (pathname !== "/") {
      router.replace("/login");
    }
    setLoadingUser(false);
    return;
  }

  const parsedUser = JSON.parse(storedUser);

  if (!parsedUser?._id) {
    if (pathname !== "/") {
      router.replace("/login");
    }
    setLoadingUser(false);
    return;
  }

  setUser(parsedUser);
  setLoadingUser(false);

}, [router, pathname]);


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
  const [activeMenu, setActiveMenu] = useState("My Invoices");
  const [menuOpen, setMenuOpen] = useState(false);
  const tabs = ["All", "Paid", "Unpaid", "Overdue"];
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setCurrentPage(1); // reset to first page when tab changes
  }, [activeTab]);

  const menuItems = [
    {
      icon: <FaFileInvoiceDollar />,
      label: "Dashboard",
      path: "/dashboard-client",
    },
    { icon: <FaUsers />, label: "My Invoices", path: "/myInvoices" },
    { icon: <FaChartBar />, label: "Payments", path: "/payment-client" },
    { icon: <FaMoneyCheckAlt />, label: "Reports", path: "/reports-client" },
    { icon: <FaRegUser />, label: "Profile", path: "/profile" },
    { icon: <FaCog />, label: "Help", path: "/help" },
    { icon: <FaPhoneAlt />, label: "Contact us", path: "/contact" },
  ];

  const filteredInvoices = invoices.filter((inv) => {
    const matchesTab = activeTab === "All" ? true : inv.status === activeTab;
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.billedTo.businessName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

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
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  // Summary boxes stagger
  const itemVariant: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
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

  const itemsPerPage = 5; // Adjust as needed
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Total revenue box appears after summary boxes

  // Recent invoices appear last

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gray-200 p-4 md:p-6"
    >
      {/* ---------------- TOP MENU ---------------- */}
           <ClientNavbar user={user} handleLogout={handleLogout} />


      {/* ---------------- SUMMARY ---------------- */}

      {/* ---------------- RECENT INVOICES ---------------- */}

      <motion.h2
        variants={itemVariant}
        className="text-xl font-semibold pl-2 pt-20 mb-4"
      >
        My Invoices
      </motion.h2>
      <motion.div
        variants={itemVariant}
        className=" glass rounded-lg p-4 md:p-6 shadow overflow-x-auto"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-4">
          <div className="relative w-full md:w-1/3">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass  pl-10 pr-3 py-2 text-black placeholder-black focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-4 md:gap-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-medium text-[20px] transition pb-1 ${
                  activeTab === tab
                    ? "text-[#29268E] border-b-2 border-[#29268E]"
                    : "text-black hover:text-[#29268E]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <table className="min-w-full table-fixed  text-left min-w-full table-auto text-sm md:text-base">
          <thead className="bg-gray-100 hidden md:table-header-group  glass bg-white/30 backdrop-blur">
            <tr className="hidden md:table-row border-t border-white/20">
              <th className="px-4 py-2 w-1/6">Invoice</th>
              <th className="px-4 py-2 w-1/6">Billed To</th>
              <th className="px-4 py-2 w-1/6">Amount</th>
              <th className="px-4 py-2 w-1/6">Status</th>
              <th className="px-4 py-2 w-1/6">Date</th>
              <th className="px-4 py-2 w-1/6">Due Date</th>

              <th className="px-4 py-2 w-1/6">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedInvoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  No invoices created yet
                </td>
              </tr>
            ) : (
              paginatedInvoices.map((inv) => (
                <tr
                  key={inv._id}
                  className="border-t border-white md:table-row block md:table-row mb-4 md:mb-0"
                >
                  {/* Mobile Card */}
                  <td colSpan={6} className="block md:hidden p-2">
                    <div className="flex flex-col gap-2  p-4">
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
                        <span>
                          ₹{Number(inv.totals?.grandTotal ?? 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between w-full">
                        <span className="font-semibold">Status:</span>
                        <span
                          className={`px-2 py-1 rounded text-white ${getStatusColor(inv.status)}`}
                        >
                          {inv.status ?? "Unpaid"}
                        </span>
                      </div>
                      <div className="flex justify-between w-full">
                        <span className="font-semibold">Date:</span>
                        <span>
                          {new Date(inv.invoiceDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between w-full">
                        <span className="font-semibold">Due Date:</span>
                        <span>
                          {new Date(inv.dueDate).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex justify-end w-full mt-2">
                        <a
                          href={inv.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-200 text-blue-700 font-medium px-3 py-1 rounded hover:bg-blue-300"
                        >
                          View
                        </a>
                      </div>
                    </div>
                  </td>

                  {/* Desktop */}
                  <td className="hidden md:table-cell px-4 py-4">
                    {inv.invoiceNumber}
                  </td>
                  <td className="hidden md:table-cell px-4 py-4">
                    {inv.billedTo.businessName}
                  </td>
                  <td className="hidden md:table-cell px-4 py-4">
                    ₹{Number(inv.totals?.grandTotal ?? 0).toFixed(2)}
                  </td>
                  <td className="hidden md:table-cell px-4 py-4">
                    <span
                      className={`px-2 py-1 rounded text-white ${getStatusColor(inv.status)}`}
                    >
                      {inv.status ?? "Unpaid"}
                    </span>
                  </td>
                  <td className="hidden md:table-cell px-4 py-4">
                    {new Date(inv.invoiceDate).toLocaleDateString()}
                  </td>
                  <td className="hidden md:table-cell px-4 py-4">
                    {new Date(inv.dueDate).toLocaleDateString()}
                  </td>
                  <td className="hidden md:table-cell px-4 py-4">
                    <button className="bg-blue-200 text-blue-700 font-medium px-3 py-1 rounded hover:bg-blue-300">
                      <div className="flex justify-end w-full">
                        <a
                          href={inv.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-200 text-blue-700 font-medium rounded hover:bg-blue-300"
                        >
                          View
                        </a>
                      </div>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="flex justify-center gap-2 mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1  rounded disabled:opacity-50"
          >
            &lt;
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-300"}`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1  rounded disabled:opacity-50"
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
  <div
    onClick={onClick}
    className={`
       px-3 py-2 rounded-xl flex gap-2 items-center cursor-pointer whitespace-nowrap
      transition
      ${isActive ? "text-black bg-white/30" : "text-black hover:bg-white/20"}
    `}
  >
    {icon}
    <span>{label}</span>
  </div>
);

export default Dashboard;
