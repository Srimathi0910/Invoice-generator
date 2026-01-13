"use client";
import { authFetch } from "@/utils/authFetch";
import TetrominosLoader from "../_components/TetrominosLoader";

import { useState, useEffect } from "react";
import Link from "next/link";
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
import { motion, Variants } from "framer-motion";

const Dashboard = () => {
  const router = useRouter();

  /* ---------------- AUTH ---------------- */
  const [user, setUser] = useState<{ username: string; email?: string } | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showLoader, setShowLoader] = useState(true);
  useEffect(() => {

    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 1200);

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

    authFetch(`/api/auth/invoice?email=${user.email}`, {
      credentials: "include",
    })
      .then((data) => {
        console.log("Invoices response:", data); // ✅ debug once

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
  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter((i) => i.status === "Paid").length;
  const unpaidInvoices = invoices.filter((i) => i.status === "Unpaid").length;
  const overdueInvoices = invoices.filter((i) => i.status === "Overdue").length;

  const totalRevenue = invoices
    .filter((i) => i.status === "Paid")
    .reduce((sum, i) => sum + Number(i.amount), 0);

  /* ---------------- UI STATE ---------------- */
  const [activeTab, setActiveTab] = useState("All");
  const [activeMenu, setActiveMenu] = useState("Invoices");
  const [menuOpen, setMenuOpen] = useState(false);

  const tabs = ["All", "Paid", "Unpaid", "Overdue"];

  const menuItems = [
    { icon: <FaFileInvoiceDollar />, label: "Invoices", path: "/dashboard" },
    { icon: <FaUsers />, label: "Clients", path: "/clients" },
    { icon: <FaChartBar />, label: "Reports", path: "/reports" },
    { icon: <FaMoneyCheckAlt />, label: "Payments", path: "/payments" },
    { icon: <FaCog />, label: "Settings", path: "/settings" },
  ];

  const filteredInvoices = invoices.filter((inv) => {
    const statusMatch =
      activeTab === "All" || inv.status?.trim() === activeTab;

    const clientName =
      inv.billedTo?.businessName?.toLowerCase() || "";

    const searchMatch = clientName.includes(searchTerm.toLowerCase());

    return statusMatch && searchMatch;
  });



  // Navbar slides from top
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
  if (showLoader) {
    return (
      <div className="relative w-full h-screen flex items-center justify-center bg-gray-50">
        <TetrominosLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#D9D9D9] p-4 md:p-6">
      {/* ---------------- TOP MENU ---------------- */}
      <motion.div
        variants={navbarVariants}
        initial="hidden"
        animate="visible"
        className="bg-white dark:bg-gray-900 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 shadow"
      >



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
      </motion.div>

      {/* ---------------- SUMMARY ---------------- */}
      <motion.div
        variants={summaryContainerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12 auto-rows-[120px]"

      >
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
            <span className="text-sm text-center text-[20px] font-medium">
              Total Revenue
            </span>
            <hr className="border-gray-300 my-2" />
            <div className="text-center text-xl font-semibold mb-3">
              ${totalRevenue}
            </div>

            <Link
              href="/company-new-invoice"
              className="mt-auto bg-[#D9D9D9] text-black py-2 px-4 rounded-[12px] 
            hover:bg-[#2326AF] hover:text-white transition inline-block text-center"
            >
              Create Invoice
            </Link>
          </div>
        </motion.div>
      </motion.div>
      {/* ---------------- RECENT INVOICES ---------------- */}
      <motion.h2
        variants={navbarVariants}
        initial="hidden"
        animate="visible" className="text-xl font-semibold pl-2 pt-20 mb-4">Recent Invoices</motion.h2>

      <motion.div
        variants={recentInvoicesVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-lg p-4 md:p-6 shadow overflow-x-auto"
      >
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

        <div className="overflow-x-auto w-full">
          <table className="min-w-full border table-auto text-sm md:text-base">
            <thead className="bg-gray-100 dark:bg-gray-900">
              <tr className="hidden md:table-row"> {/* Hide headers on small screens */}
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
                    status={(inv.status ?? "N/A").trim()}
                    date={new Date(inv.invoiceDate).toLocaleDateString()}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>


      </motion.div>
    </div >
  );
};

/* ---------------- COMPONENTS ---------------- */

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

const SummaryBox = ({ title, value, bg, innerBg }: any) => (
  <div
    className="text-white rounded shadow flex flex-col justify-between"
    style={{ backgroundColor: bg }}
  >
    <span className="text-sm text-center pt-3">{title}</span>
    <div
      className="w-full text-center py-4 font-semibold text-lg"
      style={{ backgroundColor: innerBg }}
    >
      {value}
    </div>
  </div>
);

const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="px-2 md:px-4 py-1 md:py-2 text-left whitespace-nowrap text-sm md:text-base">
    {children}
  </th>
);


const InvoiceRow = ({ id, client, amount, status, date }: any) => {
  const colors: Record<string, string> = {
    Paid: "bg-[#05410C]",
    Unpaid: "bg-[#E06A2A]",
    Overdue: "bg-[#E51F22]",
  };

  return (
    <tr className="border-t md:table-row block md:table-row mb-4 md:mb-0"> {/* block on small screens */}
      <td className="px-2 md:px-6 py-1 md:py-4 block md:table-cell">
        <span className="font-semibold md:hidden">Invoice:</span> {id}
      </td>
      <td className="px-2 md:px-4 py-1 md:py-2 block md:table-cell">
        <span className="font-semibold md:hidden">Client:</span> {client}
      </td>
      <td className="px-2 md:px-4 py-1 md:py-2 block md:table-cell">
        <span className="font-semibold md:hidden">Amount:</span> {amount}
      </td>
      <td className="px-2 md:px-4 py-1 md:py-2 block md:table-cell">
        <span className="font-semibold md:hidden">Status:</span>
        <button className={`px-2 py-1 text-white rounded ${colors[status] ?? "bg-gray-400"}`}>
          {status}
        </button>
      </td>
      <td className="px-2 md:px-4 py-1 md:py-2 block md:table-cell">
        <span className="font-semibold md:hidden">Date:</span> {date}
      </td>
    </tr>
  );
};




export default Dashboard;
