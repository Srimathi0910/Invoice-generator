"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  FaFileInvoiceDollar,
  FaUsers,
  FaChartBar,
  FaMoneyCheckAlt,
  FaCog,
  FaUserCircle,
  FaBars,
  FaTimes,
  FaPhoneAlt,
} from "react-icons/fa";
import { motion, Variants } from "framer-motion";

export default function Navbar1({ user, handleLogout }: any) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    { icon: <FaFileInvoiceDollar />, label: "Invoices", path: "/dashboard" },
    { icon: <FaUsers />, label: "Clients", path: "/clients" },
    { icon: <FaChartBar />, label: "Reports", path: "/reports" },
    { icon: <FaMoneyCheckAlt />, label: "Payments", path: "/payments" },
    { icon: <FaCog />, label: "Settings", path: "/settings" },
    { icon: <FaPhoneAlt />, label: "Contact us", path: "/contact" },
  ];

  const navbarVariants: Variants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      variants={navbarVariants}
      initial="hidden"
      animate="visible"
      className="glass rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 shadow"
    >
      {/* LOGO */}
      <div className="text-xl font-bold cursor-pointer mb-3 md:mb-0">
        {/* LOGO */}
      </div>

      {/* MOBILE TOGGLE */}
      <motion.div
        variants={navbarVariants}
        initial="hidden"
        animate="visible"
        className="md:hidden flex items-center mb-3"
      >
        <button onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </motion.div>

      {/* MENU */}
      <div
        className={`flex flex-col md:flex-row md:items-center md:space-x-10 w-full md:w-auto ${
          menuOpen ? "flex" : "hidden md:flex"
        }`}
      >
        {menuItems.map((item) => (
          <MenuItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            isActive={
              pathname === item.path ||
              pathname.startsWith(item.path + "/")
            }
            onClick={() => {
              router.push(item.path);
              setMenuOpen(false); // close menu on mobile
            }}
          />
        ))}

        {/* USER */}
        <div className="flex flex-col items-end space-y-2">
          <div className="flex items-center space-x-3 glass px-4 py-2 rounded shadow">
            <FaUserCircle size={28} />
            <span className="font-medium">
              {user?.username || "User"}
            </span>
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
  );
}

// -------------------- Menu Item --------------------
const MenuItem = ({ icon, label, isActive, onClick }: any) => (
  <div
    onClick={onClick}
    className={`
      px-3 py-2 rounded-xl flex gap-2 items-center cursor-pointer whitespace-nowrap
      transition
      ${
        isActive
          ? "text-black bg-white/30"
          : "text-black hover:bg-white/20"
      }
    `}
  >
    {icon}
    <span>{label}</span>
  </div>
);
