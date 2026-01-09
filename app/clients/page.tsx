"use client";
import { authFetch} from "@/utils/authFetch"; 
import { motion, Variants } from "framer-motion";

import { useState, useMemo, useEffect } from "react";
import { Pencil, Search } from "lucide-react";
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

/* ---------------- TYPES ---------------- */
type Client = {
  id: string;
  name: string;
  email?: string;   // ✅ already present
  phone: string;
  gstin: string;
  totalInvoices: number;
};

/* ---------------- COMPONENT ---------------- */
export default function ClientsPage() {
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [activeMenu, setActiveMenu] = useState("Clients");
  const [menuOpen, setMenuOpen] = useState(false);

  const [user, setUser] = useState<{ username: string } | null>(null);

  const itemsPerPage = 5;

  const menuItems = [
    { icon: <FaFileInvoiceDollar />, label: "Invoices", path: "/dashboard" },
    { icon: <FaUsers />, label: "Clients", path: "/clients" },
    { icon: <FaChartBar />, label: "Reports", path: "/reports" },
    { icon: <FaMoneyCheckAlt />, label: "Payments", path: "/payments" },
    { icon: <FaCog />, label: "Settings", path: "/settings" },
  ];

  /* ---------------- AUTH CHECK ---------------- */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.replace("/login");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  /* ---------------- FETCH CLIENTS ---------------- */
 useEffect(() => {
  const fetchClients = async () => {
    try {
      const data = await authFetch("/api/auth/clients");

      console.log("Clients API response:", data); // 🔍 debug once

      // Handle both response shapes safely
      if (Array.isArray(data)) {
        setClients(data);
      } else if (Array.isArray(data.clients)) {
        setClients(data.clients);
      } else {
        setClients([]);
      }
    } catch (err) {
      console.error("Failed to fetch clients", err);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  fetchClients();
}, []);


  /* ---------------- SEARCH ---------------- */
  const filteredClients = useMemo(() => {
    return clients.filter((client) =>
      client.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [clients, search]);

  /* ---------------- PAGINATION ---------------- */
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredClients.slice(start, start + itemsPerPage);
  }, [filteredClients, currentPage]);

  /* ---------------- HANDLERS ---------------- */
  const handleEdit = (id: string) => {
    alert(`Edit client ${id}`);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.clear();
    router.push("/");
  };


  const handleAddClient = () => {
    alert("Add Client Clicked");
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

  /* ---------------- UI ---------------- */
  return (
    <motion.div
  variants={staggerContainer}
  initial="hidden"
  animate="visible"
  className="min-h-screen bg-gray-100 p-6"
>

      {/* -------- HEADER -------- */}
      <motion.div
        variants={navbarVariants}
        initial="hidden"
        animate="visible" className="bg-white rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 shadow">
        <motion.div variants={itemVariant}className="text-xl font-bold cursor-pointer mb-3 md:mb-0">
          {/* LOGO */}
        </motion.div>

        <motion.div variants={itemVariant}className="md:hidden flex items-center mb-3">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </motion.div>

       <motion.div variants={itemVariant}
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
        </motion.div>
      </motion.div>
     <motion.div
      variants={summaryContainerVariants}
        initial="hidden"
        animate="visible" className="flex justify-end items-center mb-4 gap-4 ">
        {/* Add Client button */}


        {/* Search input */}
        <motion.div variants={itemVariant} className="relative w-1/3">
          <input
            type="text"
            placeholder="Search Clients"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded w-full pl-10 pr-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </motion.div>
        <motion.button variants={itemVariant}
          onClick={handleAddClient}
          className="bg-white text-black px-4 py-2 rounded flex items-center gap-2"
        >
          + Add Client
        </motion.button>
      </motion.div>

      {/* -------- SEARCH -------- */}
      <motion.div variants={itemVariant} className="relative w-full md:w-1/3 mb-4 ">
        <input
          type="text"
          placeholder="Search Clients"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded w-full pl-10 pr-2 py-2 focus:ring-2 focus:ring-blue-500"
        />
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
      </motion.div>

      {/* -------- TABLE -------- */}
      <motion.div variants={itemVariant}className="bg-white rounded shadow overflow-x-auto ">
        {loading ? (
          <div className="text-center py-10">Loading clients...</div>
        ) : (
          <table className="w-full text-sm border-collapse border">
            <thead className="bg-gray-200">
              <tr>
                <th className="border px-4 py-2 text-left">Client Name</th>
                <th className="border px-4 py-2 text-left">Phone</th>
                <th className="border px-4 py-2 text-left">GSTIN</th>
                <th className="border px-4 py-2 text-center">Total Invoices</th>
                <th className="border px-4 py-2 text-left">Email</th> 
                <th className="border px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedClients.length > 0 ? (
                paginatedClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{client.name}</td>
                    <td className="border px-4 py-2">{client.phone}</td>
                    <td className="border px-4 py-2">{client.gstin}</td>
                    <td className="border px-4 py-2 text-center">
                      {client.totalInvoices}
                    </td>

                    {/* ✅ EMAIL COLUMN */}
                    <td className="border px-4 py-2">
                      {client.email || "-"}
                    </td>

                    <td className="border px-4 py-2 text-center">
                      <button
                        onClick={() => handleEdit(client.id)}
                        className="bg-gray-200 px-4 py-2 rounded flex gap-1 items-center justify-center mx-auto"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                    </td>
                  </tr>

                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center">
                    No clients found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* -------- PAGINATION -------- */}
      <motion.div variants={itemVariant}className="flex justify-center gap-2 mt-4">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className="px-3 py-1 border rounded"
        >
          &lt;
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 border rounded ${currentPage === i + 1 ? "bg-blue-500 text-white" : ""
              }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="px-3 py-1 border rounded"
        >
          &gt;
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ---------------- MENU ITEM ---------------- */
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