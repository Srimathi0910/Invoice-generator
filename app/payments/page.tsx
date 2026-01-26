"use client";
import { authFetch } from "@/utils/authFetch";
import { useEffect, useState } from "react";
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
  FaPhoneAlt
} from "react-icons/fa";
import { motion, Variants } from "framer-motion";
import TetrominosLoader from "../_components/TetrominosLoader";
import Navbar1 from "../_components/navbar/Navbar1";
type Payment = {
  _id: string;
  invoiceNumber: string;
  clientName: string;
  paymentDate: string;
  paymentMethod: string;
  paymentStatus: "Paid" | "Unpaid" | "Overdue";
  amount: number;
};

export default function PaymentsPage() {
  const router = useRouter();
  const pathname = usePathname(); // get current path
  const [user, setUser] = useState<{ username: string; email?: string } | null>(
    null,
  );
  const [loadingUser, setLoadingUser] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editRow, setEditRow] = useState<string | null>(null); // Track which row is editable
  const [activeMenu, setActiveMenu] = useState("Payments");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const tabs = ["All", "Paid", "Unpaid", "Overdue"];
  const [currentPage, setCurrentPage] = useState(1);
  const [savingRowId, setSavingRowId] = useState<string | null>(null);

  const menuItems = [
    { icon: <FaFileInvoiceDollar />, label: "Invoices", path: "/dashboard" },
    { icon: <FaUsers />, label: "Clients", path: "/clients" },
    { icon: <FaChartBar />, label: "Reports", path: "/reports" },
    { icon: <FaMoneyCheckAlt />, label: "Payments", path: "/payments" },
    { icon: <FaCog />, label: "Settings", path: "/settings" },
    { icon: <FaPhoneAlt />, label: "Contact us", path: "/contact" },
  ];
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

  // 🚫 No user → redirect (except home page)
  if (!storedUser) {
    if (pathname !== "/") {
      router.replace("/login");
    }
    setLoadingUser(false);
    return; // stop further execution
  }

  // ✅ Parse user safely
  const parsedUser = JSON.parse(storedUser);

  // 🚫 Invalid user object → redirect (except home page)
  if (!parsedUser?._id) {
    if (pathname !== "/") {
      router.replace("/login");
    }
    setLoadingUser(false);
    return;
  }

  // ✅ Valid user
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
  useEffect(() => {
    // Show loader for 3 seconds
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 1200); // 3000ms = 3 seconds

    return () => clearTimeout(timer); // cleanup
  }, []);

  useEffect(() => {
    // fetch payments after loader
    if (!showLoader) {
      authFetch("/api/auth/payments")
        .then((data) => {
          if (data.success) setPayments(data.payments);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [showLoader]);

  const filteredPayments = payments.filter((p) => {
    const statusMatch = activeTab === "All" || p.paymentStatus === activeTab;

    const searchMatch =
      p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());

    return statusMatch && searchMatch;
  });
  const totalPayments = filteredPayments.reduce((acc, p) => acc + p.amount, 0);

  const handleUpdate = async (id: string, payment: Partial<Payment>) => {
    try {
      const data = await authFetch(`/api/auth/invoice/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentDate: payment.paymentDate,
          paymentMethod: payment.paymentMethod,
          paymentStatus: payment.paymentStatus,
        }),
      });

      if (data.success) {
        setPayments((prev) =>
          prev.map((p) => (p._id === id ? { ...p, ...payment } : p)),
        );
      } else {
        throw new Error("Update failed");
      }
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  /* ---------------- PAGINATION SETUP ---------------- */
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  if (loadingUser || loading) {
    // Show loader when either user or payments are loading
    return (
      <div className="relative w-full h-screen flex items-center justify-center bg-gray-50">
        <TetrominosLoader />
      </div>
    );
  }
  const navbarVariants: Variants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
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

  // Total revenue box appears after summary boxes

  // Recent invoices appear last
  const recentInvoicesVariants: Variants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut", delay: 1 },
    },
  };

  const summaryItemVariants: Variants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const revenueVariants: Variants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut", delay: 0.6 },
    },
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gray-200 p-4 md:p-6"
    >
            <Navbar1 user={user} handleLogout={handleLogout} />

      <h1 className="text-2xl font-bold mb-4">Payments</h1>

      {/* <motion.div variants={itemVariant} className="mb-4">
                <button className=" glass px-4 py-2 rounded shadow">+ Add Payment</button>
            </motion.div> */}
      {/* <motion.div variants={itemVariant} className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-4">

                    <div className="relative w-full md:w-1/3">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by client..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full glass rounded-b-xl pl-10 pr-3 py-2 text-white placeholder-black focus:outline-none"
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
            </motion.div> */}

      <motion.div
        variants={itemVariant}
        className="overflow-x-auto glass rounded shadow p-4"
      >
        <motion.div
          variants={itemVariant}
          className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-4 z-100"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-4">
            <div className="relative w-full md:w-1/3">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
        </motion.div>
        <table className="w-full text-sm  min-w-full table-auto text-sm md:text-base">
          <thead className="bg-gray-200 hidden md:table-header-group bg-white/30 backdrop-blur">
            <tr className="hidden md:table-row">
              <Th>Invoice Number</Th>
              <Th>Client Name</Th>
              <Th>Payment Date</Th>
              <Th>Payment Method</Th>
              <Th>Payment Status</Th>
              <Th>Amount</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {paginatedPayments.length > 0 ? (
              paginatedPayments.map((p) => {
                const isEditing = editRow === p._id;
                return (
                  <tr
                    key={p._id}
                    className="border-t border-white md:table-row block md:table-row mb-4 md:mb-0"
                  >
                    {/* Mobile Card */}
                    <td colSpan={7} className="block md:hidden p-2">
                      <div className="flex flex-col gap-2  p-4">
                        <div className="flex justify-between w-full">
                          <span className="font-semibold">Invoice Number:</span>
                          <span>{p.invoiceNumber}</span>
                        </div>
                        <div className="flex justify-between w-full">
                          <span className="font-semibold">Client Name:</span>
                          <span>{p.clientName}</span>
                        </div>
                        <div className="flex justify-between w-full">
                          <span className="font-semibold">Payment Date:</span>
                          {isEditing ? (
                            <input
                              type="date"
                              value={
                                p.paymentDate
                                  ? new Date(p.paymentDate)
                                      .toISOString()
                                      .split("T")[0]
                                  : ""
                              }
                              className="border px-2 py-1 rounded text-center"
                              onChange={(e) =>
                                setPayments((prev) =>
                                  prev.map((pay) =>
                                    pay._id === p._id
                                      ? { ...pay, paymentDate: e.target.value }
                                      : pay,
                                  ),
                                )
                              }
                            />
                          ) : (
                            <span>
                              {new Date(p.paymentDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between w-full">
                          <span className="font-semibold">Payment Method:</span>
                          {isEditing ? (
                            <select
                              value={p.paymentMethod || "NA"}
                              className="px-2 py-1 rounded border text-center"
                              onChange={(e) =>
                                setPayments((prev) =>
                                  prev.map((pay) =>
                                    pay._id === p._id
                                      ? {
                                          ...pay,
                                          paymentMethod: e.target.value,
                                        }
                                      : pay,
                                  ),
                                )
                              }
                            >
                              <option value="NA">NA</option>
                              <option value="UPI">UPI</option>
                              <option value="Credit/Debit Card">
                                Credit/Debit Card
                              </option>
                              <option value="Net Banking">Net Banking</option>
                              <option value="Wallet">Wallet</option>
                            </select>
                          ) : (
                            <span>{p.paymentMethod}</span>
                          )}
                        </div>
                        <div className="flex justify-between w-full items-center relative">
                          <span className="font-semibold">Payment Status:</span>

                          {isEditing ? (
                            <div className="relative w-32">
                              <select
                                value={p.paymentStatus}
                                onChange={(e) =>
                                  setPayments((prev) =>
                                    prev.map((pay) =>
                                      pay._id === p._id
                                        ? {
                                            ...pay,
                                            paymentStatus: e.target.value as
                                              | "Paid"
                                              | "Unpaid"
                                              | "Overdue",
                                          }
                                        : pay,
                                    ),
                                  )
                                }
                                className="px-3 py-1 rounded w-full cursor-pointer border border-gray-300 text-white appearance-none focus:outline-none"
                                style={{
                                  backgroundColor:
                                    p.paymentStatus === "Paid"
                                      ? "#05410C"
                                      : p.paymentStatus === "Unpaid"
                                        ? "#E06A2A"
                                        : "#E51F22",
                                }}
                              >
                                <option
                                  value="Paid"
                                  className="text-white bg-[#05410C]"
                                >
                                  Paid
                                </option>
                                <option
                                  value="Unpaid"
                                  className="text-white bg-[#E06A2A]"
                                >
                                  Unpaid
                                </option>
                                <option
                                  value="Overdue"
                                  className="text-white bg-[#E51F22]"
                                >
                                  Overdue
                                </option>
                              </select>

                              {/* Custom arrow using SVG */}
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                <svg
                                  className="w-4 h-4 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </div>
                            </div>
                          ) : (
                            <span
                              className={`px-2 py-1 rounded text-white ${
                                p.paymentStatus === "Paid"
                                  ? "bg-[#05410C]"
                                  : p.paymentStatus === "Unpaid"
                                    ? "bg-[#E06A2A]"
                                    : "bg-[#E51F22]"
                              }`}
                            >
                              {p.paymentStatus}
                            </span>
                          )}
                        </div>

                        <div className="flex justify-between w-full">
                          <span className="font-semibold">Amount:</span>
                          <span>Rs.{p.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-end w-full mt-2">
                          {isEditing ? (
                            <>
                              <button
                                disabled={savingRowId === p._id}
                                className={`px-2 py-1 rounded mr-2 cursor-pointer text-white ${
                                  savingRowId === p._id
                                    ? "bg-green-500 cursor-not-allowed"
                                    : "bg-green-500 hover:bg-green-600"
                                }`}
                                onClick={async () => {
                                  if (savingRowId) return; // extra safety

                                  setSavingRowId(p._id);

                                  try {
                                    await handleUpdate(p._id, {
                                      paymentDate: p.paymentDate,
                                      paymentMethod: p.paymentMethod,
                                      paymentStatus: p.paymentStatus,
                                    });

                                    setEditRow(null);
                                  } catch (err) {
                                    console.error("Update failed", err);
                                  } finally {
                                    setSavingRowId(null);
                                  }
                                }}
                              >
                                {savingRowId === p._id ? "Saving..." : "Save"}
                              </button>

                              <button
                                className="bg-gray-400 text-white px-2 py-1 rounded  cursor-pointer"
                                onClick={() => setEditRow(null)}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              className="bg-blue-500 text-white px-2 py-1 rounded"
                              onClick={() => setEditRow(p._id)}
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Desktop Columns */}
                    <td className="hidden md:table-cell p-2 text-center text-center">
                      {p.invoiceNumber}
                    </td>
                    <td className="hidden md:table-cell p-2 text-center ">
                      {p.clientName}
                    </td>
                    <td className="hidden md:table-cell p-2 text-center ">
                      {isEditing ? (
                        <input
                          type="date"
                          value={
                            p.paymentDate
                              ? new Date(p.paymentDate)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          className="border px-2 py-1 rounded text-center"
                          onChange={(e) =>
                            setPayments((prev) =>
                              prev.map((pay) =>
                                pay._id === p._id
                                  ? { ...pay, paymentDate: e.target.value }
                                  : pay,
                              ),
                            )
                          }
                        />
                      ) : (
                        new Date(p.paymentDate).toLocaleDateString()
                      )}
                    </td>
                    <td className="hidden md:table-cell p-2 text-center ">
                      {isEditing ? (
                        <select
                          value={p.paymentMethod || "NA"}
                          className="px-2 py-1 rounded border text-center"
                          onChange={(e) =>
                            setPayments((prev) =>
                              prev.map((pay) =>
                                pay._id === p._id
                                  ? { ...pay, paymentMethod: e.target.value }
                                  : pay,
                              ),
                            )
                          }
                        >
                          <option value="NA">NA</option>
                          <option value="UPI">UPI</option>
                          <option value="Credit/Debit Card">
                            Credit/Debit Card
                          </option>
                          <option value="Net Banking">Net Banking</option>
                          <option value="Wallet">Wallet</option>
                        </select>
                      ) : (
                        p.paymentMethod
                      )}
                    </td>
                    <td className="hidden md:table-cell text-center p-2 ">
                      {isEditing ? (
                        <select
                          value={p.paymentStatus}
                          className="px-2 py-1 rounded text-black cursor-pointer glass text-center border border-gray-300"
                          onChange={(e) =>
                            setPayments((prev) =>
                              prev.map((pay) =>
                                pay._id === p._id
                                  ? {
                                      ...pay,
                                      paymentStatus: e.target.value as
                                        | "Paid"
                                        | "Unpaid"
                                        | "Overdue",
                                    }
                                  : pay,
                              ),
                            )
                          }
                          style={{
                            color:
                              p.paymentStatus === "Paid"
                                ? "#FFFFFF"
                                : p.paymentStatus === "Unpaid"
                                  ? "#FFFFFF"
                                  : "#FFFFFF", // text color white for contrast if needed
                            backgroundColor:
                              p.paymentStatus === "Paid"
                                ? "#05410C"
                                : p.paymentStatus === "Unpaid"
                                  ? "#E06A2A"
                                  : "#E51F22", // only the selected value color
                          }}
                        >
                          <option
                            value="Paid"
                            className="text-white bg-[#05410C]"
                          >
                            Paid
                          </option>
                          <option
                            value="Unpaid"
                            className="text-white bg-[#E06A2A]"
                          >
                            Unpaid
                          </option>
                          <option
                            value="Overdue"
                            className="text-white bg-[#E51F22]"
                          >
                            Overdue
                          </option>
                        </select>
                      ) : (
                        <span
                          className={`px-2 py-1 rounded text-center text-white ${
                            p.paymentStatus === "Paid"
                              ? "bg-[#05410C]"
                              : p.paymentStatus === "Unpaid"
                                ? "bg-[#E06A2A]"
                                : "bg-[#E51F22]"
                          }`}
                        >
                          {p.paymentStatus}
                        </span>
                      )}
                    </td>

                    <td className="hidden md:table-cell text-center p-2 ">
                      Rs.{p.amount.toLocaleString()}
                    </td>
                    <td className="hidden md:table-cell p-2 text-center ">
                      {isEditing ? (
                        <>
                          <button
                            disabled={savingRowId === p._id}
                            className={`px-2 py-1 rounded mr-2 text-center cursor-pointer ${
                              savingRowId === p._id
                                ? "bg-green-400 text-white cursor-not-allowed"
                                : "bg-green-500 hover:bg-green-600 text-white"
                            }`}
                            onClick={async () => {
                              setSavingRowId(p._id);

                              try {
                                await handleUpdate(p._id, {
                                  paymentDate: p.paymentDate,
                                  paymentMethod: p.paymentMethod,
                                  paymentStatus: p.paymentStatus,
                                });

                                setEditRow(null);
                              } finally {
                                setSavingRowId(null);
                              }
                            }}
                          >
                            {savingRowId === p._id ? "Saving..." : "Save"}
                          </button>

                          <button
                            className="bg-gray-400 text-white px-2 py-1 rounded  cursor-pointer"
                            onClick={() => setEditRow(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          className="bg-blue-500 text-white px-2 py-1 rounded"
                          onClick={() => setEditRow(p._id)}
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-6 text-center">
                  No payments found
                </td>
              </tr>
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

        <div className="text-right mt-4 font-semibold">
          Total Payments: Rs.{totalPayments.toLocaleString()}
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
      ${isActive ? "text-black bg-white/30" : "text-black hover:bg-white/20"}
    `}
  >
    {icon}
    <span>{label}</span>
  </div>
);
const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="px-2 md:px-4 py-1 md:py-2 text-center whitespace-nowrap text-sm md:text-base">
    {children}
  </th>
);
