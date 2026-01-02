"use client";

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

const Dashboard = () => {
  const router = useRouter();

  /* ---------------- AUTH ---------------- */
  const [user, setUser] = useState<{ username: string; email?: string } | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

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
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  /* ---------------- INVOICES ---------------- */
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.email) return;

    fetch(`/api/auth/invoice?email=${user.email}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then(setInvoices)
      .catch((err) => console.error("Failed to fetch invoices", err));
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

  const filteredInvoices =
    activeTab === "All"
      ? invoices
      : invoices.filter((i) => i.status === activeTab);

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#D9D9D9] p-4 md:p-6">
      {/* ---------------- TOP MENU ---------------- */}
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
      </div>

      {/* ---------------- SUMMARY ---------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12 auto-rows-[120px]">
        <SummaryBox title="Total Invoices" value={totalInvoices} bg="#29268E" innerBg="#2326AF" />
        <SummaryBox title="Paid Invoices" value={paidInvoices} bg="#05410C" innerBg="#086212" />
        <SummaryBox title="Unpaid Invoices" value={unpaidInvoices} bg="#E06A2A" innerBg="#F87731" />
        <SummaryBox title="Overdue Invoices" value={overdueInvoices} bg="#E51F22" innerBg="#F91A1E" />

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
      </div>

      {/* ---------------- RECENT INVOICES ---------------- */}
      <h2 className="text-xl font-semibold pl-2 pt-20 mb-4">Recent Invoices</h2>

      <div className="bg-white rounded-lg p-4 md:p-6 shadow overflow-x-auto">
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

        <table className="min-w-full border table-auto">
          <thead className="bg-gray-100">
            <tr>
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
                  status={(inv.status ?? "N/A").trim()} // remove spaces
                  date={new Date(inv.invoiceDate).toLocaleDateString()}
                />

              ))
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
};

/* ---------------- COMPONENTS ---------------- */

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
  <th className="px-4 py-2 text-left whitespace-nowrap">{children}</th>
);

const InvoiceRow = ({ id, client, amount, status, date }: any) => {
  const colors: Record<string, string> = {
    Paid: "bg-[#05410C]",       // dark green
    Unpaid: "bg-[#E06A2A]",     // orange
    Overdue: "bg-[#E51F22]",    // red
  };


  return (
    <tr className="border-t">
      <td className="px-4 py-2">{id}</td>
      <td className="px-4 py-2">{client}</td>
      <td className="px-4 py-2">{amount}</td>
      <td className="px-4 py-2">
        <button className={`px-2 py-1 text-white rounded ${colors[status] ?? "bg-gray-400"}`}>
          {status}
        </button>

      </td>
      <td className="px-4 py-2">{date}</td>
    </tr>
  );
};


export default Dashboard;
