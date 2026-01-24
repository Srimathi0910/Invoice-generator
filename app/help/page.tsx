"use client";

import { useState, useEffect } from "react";
import { Mail, Phone } from "lucide-react"; // optional icons
import { useRouter } from "next/navigation";
import { authFetch } from "@/utils/authFetch";
import {
    FaFileInvoiceDollar, FaUsers, FaChartBar, FaMoneyCheckAlt, FaCog,
    FaUserCircle, FaSearch, FaBars, FaTimes,FaRegUser
} from "react-icons/fa";
import { motion, Variants } from "framer-motion";
import TetrominosLoader from "../_components/TetrominosLoader";

const faqsData = [
    { question: "How do I create a new invoice?", answer: "To create a new invoice, go to the Dashboard, click 'New Invoice', fill out the details and click 'Save'." },
    { question: "How can I track my payments?", answer: "Go to 'My Invoices' and check the status column to track your payments." },
    { question: "How can I download?", answer: "You can download invoices as PDF by clicking the download button next to each invoice." },
    { question: "How to pay the invoice bill?", answer: "Click 'Payments' in the menu and follow the payment instructions." },
];

export default function HelpPage() {
    const router = useRouter();
    const [activeMenu, setActiveMenu] = useState("Help");
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState<{ username: string; email: string } | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);
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




    const menuItems = [
        { icon: <FaFileInvoiceDollar />, label: "Dashboard", path: "/dashboard-client" },
        { icon: <FaUsers />, label: "My Invoices", path: "/myInvoices" },
        { icon: <FaChartBar />, label: "Payments", path: "/payment-client" },
       { icon: <FaMoneyCheckAlt />, label: "Reports", path: "/reports-client" },
           { icon: <FaRegUser />, label: "Profile", path: "/profile" },
        { icon: <FaCog />, label: "Help", path: "/help" },
    ];


    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };
    // Navbar slides from top
    const navbarVariants: Variants = {
        hidden: { y: -100, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
    };
    const itemVariant: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.4, ease: "easeOut" },
        },
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
    if (showLoader) {
        return (
            <div className="relative w-full h-screen flex items-center justify-center bg-gray-50">
                <TetrominosLoader />
            </div>
        );
    }
    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible" className="min-h-screen bg-gray-200 p-4 md:p-6">
            <motion.div
                variants={navbarVariants}
                initial="hidden"
                animate="visible" className="glass rounded-2xl  p-4 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 shadow">
                <motion.div variants={itemVariant} className="text-xl font-bold cursor-pointer mb-3 md:mb-0"></motion.div>

                <motion.div variants={itemVariant} className="md:hidden flex items-center mb-3">
                    <button onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                    </button>
                </motion.div>

                <motion.div variants={itemVariant} className={`flex flex-col md:flex-row md:items-center md:space-x-10 w-full md:w-auto ${menuOpen ? "flex" : "hidden md:flex"}`}>
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
                        <div className="flex items-center space-x-3 glass px-4 py-2 rounded shadow">
                            <FaUserCircle size={28} />
                            <span className="font-medium">{user?.username || "User"}</span>
                        </div>
                        <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">Logout</button>
                    </div>
                </motion.div>
            </motion.div>
            <motion.div variants={itemVariant} className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">How can we assist you?</h1>

                {/* FAQ Section */}
                <div className="glass bg-white/20 p-6 rounded-md mb-8">
                    <h2 className="text-2xl font-bold mb-4">FAQs</h2>
                    <div className="space-y-2">
                        {faqsData.map((faq, index) => (
                            <div
                                key={index}
                                className="bg-white p-4 rounded-md shadow-sm cursor-pointer"
                                onClick={() => toggleFAQ(index)}
                            >
                                <div className="flex justify-between items-center">
                                    <span>{faq.question}</span>
                                    <span className="text-xl font-bold">{openIndex === index ? "-" : "+"}</span>
                                </div>
                                {openIndex === index && (
                                    <p className="mt-2 text-gray-700">{faq.answer}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Support */}
<div className="glass bg-white/20 p-6  p-6 sm:p-10 rounded-md">
  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
    <span>👤</span> Contact support
  </h2>

  <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 justify-center items-center">
    
    {/* Email Card */}
    <div className="bg-white px-6 py-4 rounded-md w-full max-w-[320px] h-[100px]
      shadow-[2px_4px_10px_rgba(0,0,0,0.2)]
      flex items-center gap-4">
      
      <Mail className="w-5 h-5 shrink-0" />
      <div>
        <p className="font-semibold">Email support</p>
        <p className="text-gray-600 break-all">
          support@invoice.com
        </p>
      </div>
    </div>

    {/* Phone Card */}
    <div className="bg-white px-6 py-4 rounded-md w-full max-w-[320px] h-[100px]
      shadow-[2px_4px_10px_rgba(0,0,0,0.2)]
      flex items-center gap-4">
      
      <Phone className="w-5 h-5 shrink-0" />
      <div>
        <p className="font-semibold">Call us</p>
        <p className="text-gray-600">
          9876543211
        </p>
      </div>
    </div>

  </div>
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
      ${isActive
        ? "text-black bg-white/30"
        : "text-black hover:bg-white/20"}
    `}
  >
    {icon}
    <span>{label}</span>
  </div>
);