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
  FaRegUser,
  FaPhoneAlt,
} from "react-icons/fa";
import { motion, Variants } from "framer-motion";

export default function ClientNavbar({ user, handleLogout }: any) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

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

  const navbarVariants: Variants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
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
      variants={navbarVariants}
      initial="hidden"
      animate="visible"
      className="glass rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 shadow"
    >
      <motion.div
        variants={itemVariant}
        className="text-xl font-bold cursor-pointer mb-3 md:mb-0"
      >
        {/* LOGO */}
      </motion.div>

      <motion.div
        variants={itemVariant}
        className="md:hidden flex items-center mb-3"
      >
        <button onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </motion.div>

      <motion.div
        variants={itemVariant}
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
              setMenuOpen(false);
            }}
          />
        ))}

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
