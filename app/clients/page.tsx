"use client";
import { authFetch } from "@/utils/authFetch";
import { motion, Variants } from "framer-motion";
import TetrominosLoader from "../_components/TetrominosLoader";

import { useState, useMemo, useEffect } from "react";
import { Search } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import {
  FaFileInvoiceDollar,
  FaUsers,
  FaChartBar,
  FaMoneyCheckAlt,
  FaCog,
  FaPhoneAlt,
} from "react-icons/fa";
import Navbar1 from "../_components/navbar/Navbar1";
/* ---------------- TYPES ---------------- */
type Client = {
  id: string;
  name: string;
  email?: string; // ✅ already present
  phone: string;
  gstin: string;
  totalInvoices: number;
};

/* ---------------- COMPONENT ---------------- */
export default function ClientsPage() {
  const router = useRouter();
  const pathname = usePathname(); // get current path

  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<{ username: string } | null>(null);
  const [showLoader, setShowLoader] = useState(true);
  useEffect(() => {
    // Show loader for 3 seconds
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 1200); // 3000ms = 3 seconds

    return () => clearTimeout(timer); // cleanup
  }, []);

  /* ---------------- AUTH CHECK ---------------- */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      if (pathname !== "/") {
        router.replace("/login");
      }
      return; // ⬅️ STOP here
    }

    setUser(JSON.parse(storedUser));
  }, [router, pathname]);
  /* ---------------- FETCH CLIENTS ---------------- */
  useEffect(() => {
    let isMounted = true;

    const fetchClients = async () => {
      try {
        const response = await authFetch("/api/auth/clients");
        console.log("Clients API response:", response);

        let rawClients: any[] = [];

        // handle authFetch wrapper
        if (Array.isArray(response)) {
          rawClients = response;
        } else if (Array.isArray(response.clients)) {
          rawClients = response.clients;
        } else if (Array.isArray(response.data?.clients)) {
          rawClients = response.data.clients;
        } else {
          console.warn("Unexpected API response shape:", response);
        }

        const normalizedClients: Client[] = rawClients.map((c) => ({
          id: c._id || c.id,
          name: c.name,
          phone: c.phone,
          gstin: c.gstin,
          email: c.email,
          totalInvoices: c.totalInvoices ?? 0,
        }));

        setClients(normalizedClients);
      } catch (err) {
        console.error("Failed to fetch clients", err);
        setClients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();

    return () => {
      isMounted = false;
    };
  }, []);

  /* ---------------- SEARCH ---------------- */
  const filteredClients = useMemo(() => {
    return clients.filter((client) =>
      client.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [clients, search]);

  /* ---------------- PAGINATION ---------------- */

  /* ---------------- HANDLERS ---------------- */

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

  // Summary boxes stagger
  const summaryContainerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
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

  /* ---------------- PAGINATION ---------------- */
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredClients.slice(start, start + itemsPerPage);
  }, [filteredClients, currentPage]);

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);
  if (showLoader) {
    return (
      <div className="relative w-full h-screen flex items-center justify-center bg-gray-50">
        <TetrominosLoader />
      </div>
    );
  }
  /* ---------------- UI ---------------- */
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gray-200 p-4 md:p-6"
    >
      {/* -------- HEADER -------- */}
      <Navbar1 user={user} handleLogout={handleLogout} />

      <motion.div
        variants={summaryContainerVariants}
        initial="hidden"
        animate="visible"
        className="flex justify-end items-center mb-4 gap-4 "
      >
        {/* Add Client button */}

        {/* Search input */}
        {/* <motion.div variants={itemVariant} className="relative w-1/3">
          <input
            type="text"
            placeholder="Search Clients"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded w-full pl-10 pr-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </motion.div> */}
        {/* <motion.button variants={itemVariant}
          onClick={handleAddClient}
          className="bg-white text-black px-4 py-2 rounded flex items-center gap-2"
        >
          + Add Client
        </motion.button> */}
      </motion.div>

      {/* -------- SEARCH -------- */}

      {/* -------- TABLE -------- */}
      <motion.div
        variants={itemVariant}
        className="bg-white/20 backdrop-blur-md rounded overflow-x-auto p-4 md:p-6"
      >
        <motion.div
          variants={itemVariant}
          className="relative w-full md:w-1/3 mb-4 "
        >
          <input
            type="text"
            placeholder="Search Clients"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass  pl-10 pr-3 py-2 text-black placeholder-black focus:outline-none"
          />
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
        </motion.div>
        {loading ? (
          <div className="text-center py-10 text-gray-700">
            Loading clients...
          </div>
        ) : (
          <table className="w-full text-sm md:text-base  table-auto">
            {/* Desktop headers */}
            <thead className="hidden md:table-header-group  bg-white/20 backdrop-blur">
              <tr className="border-t border-white border-white/20">
                <th className="px-4 py-2 text-center ">Client Name</th>
                <th className=" px-4 py-2 text-center  ">Phone</th>
                <th className=" px-4 py-2 text-center  ">GSTIN</th>
                <th className=" px-4 py-2 text-center ">Total Invoices</th>
                <th className=" px-4 py-2 text-center">Email</th>
              </tr>
            </thead>

            <tbody>
              {paginatedClients.length > 0 ? (
                paginatedClients.map((client) => (
                  <tr
                    key={client.id}
                    className="md:table-row block md:mb-0 md:border-t border-white  "
                  >
                    {/* Mobile layout */}
                    <td colSpan={6} className="block md:hidden px-2 py-2">
                      <div className="flex flex-col gap-2 border-t border-white  p-4  ">
                        <div className="flex justify-between w-full">
                          <span className="font-semibold text-gray-800">
                            Client Name:
                          </span>
                          <span className="text-gray-900">{client.name}</span>
                        </div>
                        <div className="flex justify-between w-full">
                          <span className="font-semibold text-gray-800">
                            Phone:
                          </span>
                          <span className="text-gray-900">{client.phone}</span>
                        </div>
                        <div className="flex justify-between w-full">
                          <span className="font-semibold text-gray-800">
                            GSTIN:
                          </span>
                          <span className="text-gray-900">{client.gstin}</span>
                        </div>
                        <div className="flex justify-between w-full">
                          <span className="font-semibold text-gray-800">
                            Total Invoices:
                          </span>
                          <span className="text-gray-900">
                            {client.totalInvoices}
                          </span>
                        </div>
                        <div className="flex justify-between w-full">
                          <span className="font-semibold text-gray-800">
                            Email:
                          </span>
                          <span className="text-gray-900">
                            {client.email || "-"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Desktop layout */}
                    <td className="hidden md:table-cell  px-4 py-2 text-center">
                      {client.name}
                    </td>
                    <td className="hidden md:table-cell  px-4 py-2 text-center">
                      {client.phone}
                    </td>
                    <td className="hidden md:table-cell  px-4 py-2 text-center">
                      {client.gstin}
                    </td>
                    <td className="hidden md:table-cell  px-4 py-2 text-center ">
                      {client.totalInvoices}
                    </td>
                    <td className="hidden md:table-cell  px-4 py-2 text-center">
                      {client.email || "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-700">
                    No clients found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
        {/* -------- PAGINATION -------- */}
        <motion.div
          variants={itemVariant}
          className="flex justify-center gap-2 mt-4"
        >
          {/* Previous button */}
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="px-3 py-1  rounded disabled:opacity-50"
          >
            &lt;
          </button>

          {/* Page numbers */}
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-300"}`}
            >
              {i + 1}
            </button>
          ))}

          {/* Next button */}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="px-3 py-1  rounded disabled:opacity-50"
          >
            &gt;
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
