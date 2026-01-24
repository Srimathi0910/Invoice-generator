"use client";

import { useState, useEffect } from "react";
import { authFetch } from "@/utils/authFetch"; // adjust the path based on your project
import TetrominosLoader from "../_components/TetrominosLoader";

import { useRouter } from "next/navigation";
import {
  FaFileInvoiceDollar, FaUsers, FaChartBar, FaMoneyCheckAlt, FaCog,
  FaUserCircle, FaSearch, FaBars, FaTimes, FaRegUser,FaPhoneAlt
} from "react-icons/fa";
import { motion, Variants } from "framer-motion";

const Dashboard = () => {
  const router = useRouter();

  /* ---------------- AUTH ---------------- */
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showLoader, setShowLoader] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

    authFetch(`/api/auth/invoice`)
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
    { icon: <FaMoneyCheckAlt />, label: "Reports", path: "/reports-client" },
    { icon: <FaRegUser />, label: "Profile", path: "/profile" },
     { icon: <FaCog />, label: "Help", path: "/help" },
        { icon: <FaPhoneAlt />, label: "Contact us", path: "/contact" },
    


   
  ];

  // Filter based on active tab
  const filteredInvoices = activeTab === "All"
    ? invoices
    : invoices.filter(i => i.status === activeTab);

  // Filter based on search term

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
  // Apply search filter
  const searchedInvoices = filteredInvoices.filter(inv =>
    inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.billedTo.businessName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(searchedInvoices.length / itemsPerPage);
  const paginatedInvoices = searchedInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
    <div className="min-h-screen bg-gray-200 p-4 md:p-6">

      {/* ---------------- TOP MENU ---------------- */}
      <motion.div variants={navbarVariants}
        initial="hidden"
        animate="visible"
        className="glass rounded-2xl  p-4 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 shadow">        <div className="text-xl font-bold cursor-pointer mb-3 md:mb-0"></div>

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
            <div className="glass flex items-center space-x-3 px-4 py-2 rounded-xl">
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
          <SummaryBox title="Total Invoices" value={totalInvoices} bg="#504e9e" innerBg="#464494" />
        </motion.div>
        <motion.div variants={summaryItemVariants}>
          <SummaryBox title="Paid Invoices" value={paidInvoices} bg="#418f4c" innerBg="#2c8136" />
        </motion.div>
        <motion.div variants={summaryItemVariants}>
          <SummaryBox title="Unpaid Invoices" value={unpaidInvoices} bg="#db7944" innerBg="#d3672d"/>
        </motion.div>
        <motion.div variants={summaryItemVariants}>
          <SummaryBox title="Overdue Invoices" value={overdueInvoices} bg="#dd2528" innerBg="#c22427" />
        </motion.div>
        <motion.div variants={revenueVariants}>
          <div className="glass-strong bg-white/40 text-white rounded-2xl p-4 flex flex-col min-h-[200px]">
            <span className="text-sm text-center text-[20px] text-black font-medium">Total Revenue</span>
          <hr className="border-black my-2" />
            <div className="text-center text-4xl text-black font-semibold p-8">₹{totalRevenue.toFixed(2)}</div>
          </div>
        </motion.div>

      </motion.div>

      {/* ---------------- RECENT INVOICES ---------------- */}
      <h2 className="text-xl font-semibold pl-2 pt-20 mb-4">Recent Invoices</h2>
      <motion.div
        variants={recentInvoicesVariants}
        initial="hidden"
        animate="visible" className="glass rounded-2xl rounded-lg p-4 md:p-6 shadow overflow-x-auto"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-4">
          <div className="relative w-full md:w-1/3">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm} // ✅ Connect value
                onChange={(e) => {
                  setSearchTerm(e.target.value); // ✅ Update state
                  setCurrentPage(1); // ✅ Reset to first page when searching
                }}
                className="w-full glass pl-10 pr-3 py-2 text-black placeholder-black focus:outline-none"
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

        <table className="min-w-full table-auto text-sm md:text-base">
          <thead className="bg-white/30 backdrop-blur">
            <tr className="hidden md:table-row border-t border-white/20">
              <Th>Invoice</Th>
              {/* <th className="px-4 py-2 w-1/6">Billed To</th> */}
              <Th>Amount</Th>
              <Th>Status</Th>
              <Th>Date</Th>
              <Th>Action</Th>
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
                <tr key={inv._id} className="border-t border-t border-white">
                  {/* Mobile layout */}
                  <td colSpan={6} className="block md:hidden px-2 py-2">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between w-full px-4">
                        <span className="font-semibold">Invoice:</span>
                        <span>{inv.invoiceNumber}</span>
                      </div>
                      {/* <div className="flex justify-between w-full px-4">
                        <span className="font-semibold">Billed To:</span>
                        <span>{inv.billedTo.businessName}</span>
                      </div> */}
                      <div className="flex justify-between w-full px-4">
                        <span className="font-semibold">Amount:</span>
                        <span>₹{Number(inv.totals?.grandTotal ?? 0).toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between w-full px-4">
                        <span className="font-semibold">Status:</span>
                        <span
                          className={`px-2 py-1 rounded text-white ${getStatusColor(inv.status)}`}
                        >
                          {inv.status ?? "Unpaid"}
                        </span>
                      </div>
                      <div className="flex justify-between w-full px-4">
                        <span className="font-semibold">Date:</span>
                        <span>{new Date(inv.invoiceDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between w-full px-4">
                        <span className="font-semibold ">
                          Action
                        </span>

                        {inv.status === "Paid" ? (
                          <span className="px-3 py-1 bg-green-200 text-green-800 rounded font-medium">
                            Paid
                          </span>
                        ) : (
                          <button
                            onClick={() => router.push(`/payment-client/${inv._id}`)}
                            className="px-3 py-1 bg-gray-300 hover:bg-gray-400 rounded font-medium"
                          >
                            Pay
                          </button>
                        )}
                      </div>


                    </div>
                  </td>

                  {/* Desktop layout */}
                  <td className="hidden md:table-cell px-4 py-4">{inv.invoiceNumber}</td>
                  {/* <td className="hidden md:table-cell px-4 py-2">{inv.billedTo.businessName}</td> */}
                  <td className="hidden md:table-cell px-4 py-2">
                    ₹{Number(inv.totals?.grandTotal ?? 0).toFixed(2)}
                  </td>

                  <td className="hidden md:table-cell px-4 py-2">
                    <button className={`px-2 py-1 text-white rounded ${getStatusColor(inv.status)}`}>
                      {inv.status ?? "Unpaid"}
                    </button>
                  </td>
                  <td className="hidden md:table-cell px-4 py-2">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                  <td className="hidden md:table-cell px-4 py-2">
                    {inv.status === "Paid" ? (
                      <span className="px-3 py-1 bg-green-200 text-green-800 rounded font-medium">Paid</span>
                    ) : (
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
        <div className="flex justify-center mt-4 gap-2 items-center">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
            disabled={currentPage === 1}
          >
            &lt;
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-100"}`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>


      </motion.div>

    </div >
  );
};

/* ---------------- COMPONENTS ---------------- */
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
  <th className="px-6 md:px-4 py-1 md:py-2 text-left whitespace-nowrap text-sm md:text-base">
    {children}
  </th>
);

const SummaryBox = ({ title, value, bg, innerBg }: any) => (
  <div
    className="text-white rounded-b-2xl shadow flex flex-col justify-between rounded-t-2xl"
    style={{ backgroundColor: bg }}
  >
    <span className="text-sm text-center p-3 rounded-t-2xl">{title}</span>
    <div
      className="w-full  rounded-b-2xl text-center py-4 font-semibold text-lg"
      style={{ backgroundColor: innerBg }}
    >
      {value}
    </div>
  </div>
);

export default Dashboard;
