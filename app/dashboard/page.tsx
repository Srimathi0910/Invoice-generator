"use client";

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
import { useState } from "react";
import Link from "next/link";

const Dashboard = () => {
  const totalInvoices = 20;
  const paidInvoices = 12;
  const unpaidInvoices = 6;
  const overdueInvoices = 2;
  const totalRevenue = "$5,000";

  const [activeTab, setActiveTab] = useState("All");
  const [activeMenu, setActiveMenu] = useState("Invoices"); // Track clicked menu
  const [menuOpen, setMenuOpen] = useState(false); // Hamburger toggle

  const tabs = ["All", "Paid", "Unpaid", "Overdue"];
  const menuItems = [
    { icon: <FaFileInvoiceDollar />, label: "Invoices" },
    { icon: <FaUsers />, label: "Clients" },
    { icon: <FaChartBar />, label: "Reports" },
    { icon: <FaMoneyCheckAlt />, label: "Payments" },
    { icon: <FaCog />, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-[#D9D9D9] p-4 md:p-6">
      {/* Top Menu */}
      <div className="bg-white rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 shadow">
        {/* LEFT : Logo */}
        <div className="text-xl font-bold cursor-pointer mb-3 md:mb-0">
          LOGO
        </div>

        {/* Hamburger icon for small screens */}
        <div className="md:hidden flex items-center mb-3">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* RIGHT : Menus + User */}
        <div
          className={`flex flex-col md:flex-row md:items-center md:space-x-10 w-full md:w-auto ${
            menuOpen ? "flex" : "hidden md:flex"
          }`}
        >
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 mb-3 md:mb-0">
            {menuItems.map((item) => (
              <MenuItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                isActive={activeMenu === item.label}
                onClick={() => setActiveMenu(item.label)}
              />
            ))}
          </div>

          <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded shadow">
            <FaUserCircle size={28} />
            <span className="font-medium">John Doe</span>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12 auto-rows-[120px]">
        <SummaryBox
          title="Total Invoices"
          value={totalInvoices}
          bg="#29268E"
          innerBg="#2326AF"
        />
        <SummaryBox
          title="Paid Invoices"
          value={paidInvoices}
          bg="#05410C"
          innerBg="#086212"
        />
        <SummaryBox
          title="Unpaid Invoices"
          value={unpaidInvoices}
          bg="#E06A2A"
          innerBg="#F87731"
        />
        <SummaryBox
          title="Overdue Invoices"
          value={overdueInvoices}
          bg="#E51F22"
          innerBg="#F91A1E"
        />
        <div className="bg-white text-black rounded shadow p-4 flex flex-col min-h-[200px]">
          <span className="text-sm text-center text-[20px] font-medium">
            Total Revenue
          </span>
          <hr className="border-gray-300 my-2" />
          <div className="text-center text-xl font-semibold mb-3">
            {totalRevenue}
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

      {/* Recent Invoices */}
      <h2 className="text-xl font-semibold pl-2 pt-20 mb-4">Recent Invoices</h2>
      <div className="bg-white rounded-lg p-4 md:p-6 shadow overflow-x-auto">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-4">
          {/* Search */}
          <div className="relative w-full md:w-1/3">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              className="w-full border border-gray-300 rounded pl-10 pr-3 py-2"
            />
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-4 md:gap-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-medium text-[20px] transition pb-1
                  ${
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
            <InvoiceRow
              id="INV-001"
              client="Client A"
              amount="$500"
              status="Paid"
            />
            <InvoiceRow
              id="INV-002"
              client="Client B"
              amount="$300"
              status="Unpaid"
            />
            <InvoiceRow
              id="INV-003"
              client="Client C"
              amount="$200"
              status="Overdue"
            />
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ---------- Components ---------- */

const MenuItem = ({ icon, label, isActive, onClick }) => (
  <div
    onClick={onClick}
    className={`flex flex-row gap-2 items-center cursor-pointer whitespace-nowrap ${
      isActive
        ? "text-[#8F90DF] underline"
        : label === "Invoices"
        ? "text-[#8F90DF]"
        : "text-black"
    }`}
  >
    {icon}
    <span>{label}</span>
  </div>
);

const SummaryBox = ({ title, value, bg, innerBg }) => (
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

const Th = ({ children }) => (
  <th className="px-4 py-2 text-left whitespace-nowrap">{children}</th>
);

const InvoiceRow = ({ id, client, amount, status }) => {
  const colors = {
    Paid: "bg-green-400",
    Unpaid: "bg-yellow-400",
    Overdue: "bg-red-400",
  };

  return (
    <tr className="border-t">
      <td className="px-4 py-2">{id}</td>
      <td className="px-4 py-2">{client}</td>
      <td className="px-4 py-2">{amount}</td>
      <td className="px-4 py-2">
        <button className={`px-2 py-1 text-white rounded ${colors[status]}`}>
          {status}
        </button>
      </td>
      <td className="px-4 py-2">2025-12-27</td>
    </tr>
  );
};

export default Dashboard;
