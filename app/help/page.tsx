"use client";

import { useState,useEffect } from "react";
import { Mail, Phone } from "lucide-react"; // optional icons
import { useRouter } from "next/navigation";

import {
    FaFileInvoiceDollar, FaUsers, FaChartBar, FaMoneyCheckAlt, FaCog,
    FaUserCircle, FaSearch, FaBars, FaTimes
} from "react-icons/fa";
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



    const menuItems = [
        { icon: <FaFileInvoiceDollar />, label: "Dashboard", path: "/dashboard-client" },
        { icon: <FaUsers />, label: "My Invoices", path: "/myInvoices" },
        { icon: <FaChartBar />, label: "Payments", path: "/payment-client" },
        { icon: <FaMoneyCheckAlt />, label: "Profile", path: "/profile" },
        { icon: <FaCog />, label: "Help", path: "/help" },
    ];


    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="bg-white rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 shadow">
                <div className="text-xl font-bold cursor-pointer mb-3 md:mb-0">Invoice Dashboard</div>

                <div className="md:hidden flex items-center mb-3">
                    <button onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                    </button>
                </div>

                <div className={`flex flex-col md:flex-row md:items-center md:space-x-10 w-full md:w-auto ${menuOpen ? "flex" : "hidden md:flex"}`}>
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
                        <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded shadow">
                            <FaUserCircle size={28} />
                            <span className="font-medium">{user?.username || "User"}</span>
                        </div>
                        <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">Logout</button>
                    </div>
                </div>
            </div>
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">How can we assist you?</h1>

                {/* FAQ Section */}
                <div className="bg-gray-300 p-4 rounded-md mb-8">
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
                <div className="bg-gray-300 p-10 rounded-md">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <span>👤?</span> Contact support
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-40">
                        <div className="bg-white px-10 py-5 rounded-md w-[300px] h-[100px] shadow-[2px_4px_10px_rgba(0,0,0,0.2)] flex items-center gap-6 p-8">
                            <Mail className="w-5 h-5" />
                            <div>
                                <p className="font-semibold">Email support</p>
                                <p className="text-gray-600">support@invoice.com</p>
                            </div>
                        </div>
                        <div className="bg-white px-10 py-5 rounded-md w-[300px] h-[100px] shadow-[2px_4px_10px_rgba(0,0,0,0.2)] flex items-center gap-6 p-8">
                            <Phone className="w-5 h-5" />
                            <div>
                                <p className="font-semibold ">Call us</p>
                                <p className="text-gray-600">9876543211</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
const MenuItem = ({ icon, label, isActive, onClick }: any) => (
    <div onClick={onClick} className={`flex flex-row gap-2 items-center cursor-pointer whitespace-nowrap ${isActive ? "text-[#8F90DF] underline" : "text-black"}`}>
        {icon}
        <span>{label}</span>
    </div>
);