"use client";

import { useState, useEffect } from "react";
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
import { IconType } from "react-icons";
import { motion, Variants } from "framer-motion";


/* ---------------- TYPES ---------------- */

interface User {
  username?: string;
  email?: string;
}

interface NavbarProps {
  user: User | null;
}

interface MenuItemProps {
  label: string;
  path: string;
  icon: IconType;
  active: boolean;
  onClick: () => void;
}

/* ---------------- ANIMATION ---------------- */

  const navbarVariants: Variants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

/* ---------------- MENU ITEM ---------------- */
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

/* ---------------- NAVBAR ---------------- */

const CompanyNavbar = ({ user }: NavbarProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    {
      label: "Invoices",
      path: "/dashboard",
      icon: FaFileInvoiceDollar,
    },
    {
      label: "Clients",
      path: "/clients",
      icon: FaUsers,
    },
    {
      label: "Reports",
      path: "/reports",
      icon: FaChartBar,
    },
    {
      label: "Payments",
      path: "/payments",
      icon: FaMoneyCheckAlt,
    },
    {
      label: "Settings",
      path: "/settings",
      icon: FaCog,
    },
    {
      label: "Contact",
      path: "/contact",
      icon: FaPhoneAlt,
    },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      router.replace("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <motion.div
      variants={navbarVariants}
      initial="hidden"
      animate="visible"
      className="glass rounded-2xl p-4 mb-6 shadow flex flex-col md:flex-row md:items-center md:justify-between"
    >
      {/* LOGO */}
      <div
        onClick={() => router.push("/dashboard")}
        className="text-2xl font-bold cursor-pointer mb-4 md:mb-0"
      >
        CompanyName
      </div>

      {/* MOBILE MENU TOGGLE */}
      <div className="md:hidden mb-3">
        <button onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
        </button>
      </div>

      {/* MENU */}
      <div
        className={`flex flex-col md:flex-row md:items-center gap-2 md:gap-6 w-full md:w-auto
        ${menuOpen ? "flex" : "hidden md:flex"}`}
      >
        {menuItems.map((item) => (
          <MenuItem
            key={item.label}
            label={item.label}
            icon={item.icon}
            active={pathname === item.path}
            onClick={() => {
              router.push(item.path);
              setMenuOpen(false);
            }}
          />
        ))}

        {/* USER */}
        <div className="flex flex-col items-end gap-2 mt-4 md:mt-0 md:ml-6">
          <div className="glass flex items-center gap-2 px-4 py-2 rounded-xl">
            <FaUserCircle size={22} />
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
};

export default CompanyNavbar;
