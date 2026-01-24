"use client";

import { useState, useEffect, useRef } from "react";
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
  FaPhoneAlt
} from "react-icons/fa";
import { authFetch } from "@/utils/authFetch";
import { motion, Variants } from "framer-motion";
import TetrominosLoader from "../_components/TetrominosLoader";


export default function SettingsPage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("Settings");
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<"company" | "preferences">("company");
  const [loadingCompany, setLoadingCompany] = useState(false);
  const [loadingPreferences, setLoadingPreferences] = useState(false);
  const [showLoader, setShowLoader] = useState(true);

  const [popup, setPopup] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    type: "info",
  });

  useEffect(() => {
    // Show loader for 3 seconds
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 1200); // 3000ms = 3 seconds

    return () => clearTimeout(timer); // cleanup
  }, []);

  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    address: "",
    gstin: "",
    phone: "",
    country: "",
    city: "",
    stateCode: "",
    logoUrl: "",
    currency: "INR",
    gstRate: 18,
    invoicePrefix: "INV-2025-",
    bankName: "",
    accountNumber: "",
    upiId: "",
  });

  const [preferences, setPreferences] = useState({
    dueDateReminder: true,
    overdueAlert: true,
    paymentReceived: true,
    reminderPeriod: 3,
    theme: "light",
    reminderDueDate: null,
  });

  // -------------------- Load user --------------------
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) router.replace("/login");
    else setUser(JSON.parse(storedUser));
  }, [router]);

  // -------------------- Load company settings --------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");
    const loadCompany = async () => {
      try {
        const data = await authFetch("/api/auth/company/settings", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });

        if (!data.data) return;

        const settings = data.data;
        setFormData({
          companyName: settings.companyName || "",
          email: settings.email || "",
          phone: settings.phone || "",
          gstin: settings.gstin || "",
          address: settings.address || "",
          city: settings.city || "",
          country: settings.country || "",
          currency: settings.currency || "INR",
          gstRate: settings.gstRate || 18,
          invoicePrefix: settings.invoicePrefix || "INV-2025-",
          bankName: settings.bankName || "",
          accountNumber: settings.accountNumber || "",
          upiId: settings.upiId || "",
          logoUrl: settings.logoUrl || "",
          stateCode: settings.stateCode || "",
        });

        setLogoPreview(settings.logoUrl || null);
      } catch (err) {
        console.error("Error loading company settings:", err);
      }
    };

    loadCompany();
  }, []);

  // -------------------- Logo upload --------------------
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setLogoFile(file);
    const base64 = await fileToBase64(file);
    setLogoPreview(base64);
  };

  // -------------------- Save company settings --------------------
  const handleSave = async () => {
    const phoneRegex = /^\d{10}$/; // exactly 10 digits
    if (!phoneRegex.test(formData.phone)) {
      setPopup({
        open: true,
        message: "Phone number must be exactly 10 digits.",
        type: "error",
      });
      return; // stop saving
    }
    try {
      setLoadingCompany(true);
      const form = new FormData();

      form.append(
        "data",
        JSON.stringify({
          companyName: formData.companyName,
          email: formData.email,
          address: formData.address,
          gstin: formData.gstin,
          phone: formData.phone, // <-- Add this
          stateCode: formData.stateCode,
          currency: formData.currency,
          gstRate: formData.gstRate,
          invoicePrefix: formData.invoicePrefix,
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          upiId: formData.upiId,
          logoUrl: formData.logoUrl,
        })
      );


      if (logoFile) {
        form.append("logo", logoFile);
      }

      const res = await fetch("/api/auth/company/settings", {
        method: "POST",
        body: form,
        credentials: "include",
      });

      const result = await res.json();

      if (result.success) {
        setPopup({
          open: true,
          message: "Settings updated successfully!",
          type: "success",
        });
        setFormData((prev) => ({
          ...prev,
          logoUrl: result.data.logoUrl,
        }));
        setLogoPreview(result.data.logoUrl);
      } else {
        setPopup({
          open: true,
          message: "Error: " + result.message,
          type: "error",
        });
      }
    } catch (err) {
      console.error(err);
      setPopup({
        open: true,
        message: "Failed to update settings",
        type: "error",
      });
    }
    finally {
      setLoadingCompany(false); // ✅ End loading
    }
  };


  // -------------------- Save preferences --------------------
  const savePreferences = async () => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    try {
      setLoadingPreferences(true); // start loading
      const data = await authFetch("/api/auth/company/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include", // <- this must be outside headers
        body: JSON.stringify(preferences),
      });

      if (data.message === "Preferences saved") {
        setPopup({
          open: true,
          message: "Preferences saved successfully!",
          type: "success",
        });
      } else {
        setPopup({
          open: true,
          message: "Error saving preferences: " + data.message,
          type: "error",
        });
      }
    } catch (err) {
      console.error(err);
      setPopup({
        open: true,
        message: "Error saving preferences",
        type: "error",
      });
    }
    finally {
      setLoadingPreferences(false); // end loading
    }
  };


  // -------------------- Logout --------------------
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error("Logout failed");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      router.replace("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const menuItems = [
    { icon: <FaFileInvoiceDollar />, label: "Invoices", path: "/dashboard" },
    { icon: <FaUsers />, label: "Clients", path: "/clients" },
    { icon: <FaChartBar />, label: "Reports", path: "/reports" },
    { icon: <FaMoneyCheckAlt />, label: "Payments", path: "/payments" },
    { icon: <FaCog />, label: "Settings", path: "/settings" },
    { icon: <FaPhoneAlt />, label: "Contact us", path: "/contact" },
  ];

  // -------------------- Theme effect --------------------
  useEffect(() => {
    if (preferences.theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, [preferences.theme]);
  // Navbar slides from top
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
  if (showLoader) {
    return (
      <div className="relative w-full h-screen flex items-center justify-center bg-gray-50">
        <TetrominosLoader />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-200 p-4 md:p-6">
      {/* NAVBAR */}
      <motion.div
        variants={navbarVariants}
        initial="hidden"
        animate="visible"
        className="glass rounded-2xl  p-4 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 shadow"
      >



        <div className="text-xl font-bold cursor-pointer mb-3 md:mb-0">
          {/* LOGO */}
        </div>

        <motion.div
          variants={navbarVariants}
          initial="hidden"
          animate="visible" className="md:hidden flex items-center mb-3">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </motion.div>

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
            <div className="flex items-center space-x-3 glass px-4 py-2 rounded shadow">
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
      </motion.div>

      {/* PAGE CONTENT */}
      <motion.div
        variants={recentInvoicesVariants}
        initial="hidden"
        animate="visible" className="px-4 sm:px-6 md:px-10 lg:px-16 py-8">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <div className="glass rounded-xl p-6 sm:p-8">
          {/* Tabs */}
          <div className="flex gap-10 mb-8">
            <span onClick={() => setActiveTab("company")} className={`cursor-pointer font-semibold pb-1 ${activeTab === "company" ? "text-[#8F90DF] underline underline-offset-7 pb-2" : "text-gray-800"}`}>Company Profile</span>
            <span onClick={() => setActiveTab("preferences")} className={`cursor-pointer font-semibold pb-1 ${activeTab === "preferences" ? "text-[#8F90DF] underline underline-offset-7 pb-1" : "text-gray-800"}`}>Preferences</span>
          </div>

          {/* Company Profile */}
          {activeTab === "company" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card title="Company Profile">
                <div className="flex gap-4 mb-4 items-center">
                  <div onClick={() => fileInputRef.current?.click()} className="w-20 h-20 border border-dashed border-white bg-white/20 rounded flex items-center justify-center cursor-pointer overflow-hidden hover:bg-gray-50">
                    {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-contain border-white bg-white/20" /> : <span className=" border-white bg-white/20 text-sm text-gray-500">Logo</span>}
                    <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleLogoChange} />
                  </div>
                  <input className="border border-white bg-white/20 px-3 py-2 w-full bg-transparent text-black placeholder-black/60 " placeholder="Company Name" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} />
                </div>

                <input className="border border-white bg-white/20 px-3 py-2 w-full mb-3" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                <textarea className="borderborder-white bg-white/20 px-3 py-2 w-full mb-3" rows={4} placeholder="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                <input className="border border-white bg-white/20 px-3 py-2 w-full mb-3" placeholder="GSTIN" value={formData.gstin} onChange={(e) => setFormData({ ...formData, gstin: e.target.value })} />
                <input
                  className="border border-white bg-white/20 px-3 py-2 w-full mb-3"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />

              </Card>

              <Card title="Payment Settings">
                <label className="block mb-1 font-medium">Default Currency</label>
                <select className="border border-white bg-white/20 px-3 py-2 w-full mb-4" value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })}>
                  <option value="INR">Indian Rupee</option>
                  <option value="USD">USD</option>
                </select>

                <label className="block mb-1 font-medium">Default GST Rate</label>
                <select className="border border-white bg-white/20 px-3 py-2 w-full mb-4" value={formData.gstRate} onChange={(e) => setFormData({ ...formData, gstRate: Number(e.target.value) })}>
                  <option value={18}>18%</option>
                  <option value={12}>12%</option>
                  <option value={5}>5%</option>
                </select>

                <label className="block mb-1 font-medium">Invoice Number Prefix</label>
                <input className="border border-white bg-white/20 px-3 py-2 w-full mb-6" value={formData.invoicePrefix} onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })} />

                <button
                  className="bg-gray-300 px-6 py-2 border border-white  rounded text-sm"
                  onClick={handleSave}
                  disabled={loadingCompany} // disable while saving
                >
                  {loadingCompany ? "Saving..." : "Save Changes"}
                </button>

              </Card>

              <div className="md:col-span-2">
                <Card title="Bank Information">
                  <label className="block mb-1 font-medium">Bank Name</label>
                  <input className="border border-white bg-white/20 px-3 py-2 w-full mb-4" placeholder="Bank Name" value={formData.bankName} onChange={(e) => setFormData({ ...formData, bankName: e.target.value })} />

                  <label className="block mb-1 font-medium">Account Number</label>
                  <input className="border border-white bg-white/20 px-3 py-2 w-full mb-4" placeholder="Account Number" value={formData.accountNumber} onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })} />

                  <label className="block mb-1 font-medium">UPI ID (Optional)</label>
                  <input className="border px-3 py-2 border border-white bg-white/20 w-full mb-6" placeholder="example@upi" value={formData.upiId} onChange={(e) => setFormData({ ...formData, upiId: e.target.value })} />

                  <button
                    className="bg-gray-300 px-6 py-2 border border-white  rounded text-sm"
                    onClick={handleSave}
                    disabled={loadingCompany} // disable while saving
                  >
                    {loadingCompany ? "Saving..." : "Save Bank Details"}
                  </button>
                </Card>
              </div>
            </div>
          )}

          {/* Preferences */}
          {activeTab === "preferences" && (
            <div>
              <Card title="Notifications Preferences">
                {["dueDateReminder", "overdueAlert", "paymentReceived"].map((field) => (
                  <label className="flex items-center gap-3" key={field}>
                    <input type="checkbox" name={field} checked={preferences[field as keyof typeof preferences] as boolean} onChange={(e) => setPreferences({ ...preferences, [field]: e.target.checked })} className="h-4 w-4" />
                    <span>{field === "dueDateReminder" ? "Due Date Reminder" : field === "overdueAlert" ? "Overdue Invoice Alert" : "Payment Received Notification"}</span>
                  </label>
                ))}
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full">
                  <span className="text-sm text-gray-600 whitespace-nowrap">
                    Reminder Period:
                  </span>

                  <select
                    value={preferences.reminderPeriod}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        reminderPeriod: Number(e.target.value),
                      })
                    }
                    className="border border-white bg-white/20 rounded px-3 py-2 text-sm w-full sm:w-auto"
                  >
                    {[1, 3, 5].map((day) => (
                      <option key={day} value={day}>
                        {day} Day{day > 1 ? "s" : ""} Before Due Date
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-6 text-right">
                  <button
                    onClick={savePreferences}
                    className="bg-gray-300 border border-white  hover:bg-gray-300 px-6 py-2 rounded text-sm"
                    disabled={loadingPreferences}
                  >
                    {loadingPreferences ? "Saving..." : "Save Changes"}
                  </button>

                </div>
              </Card>

              {/* <Card title="Appearance Preferences">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Theme:</span>
                  <select value={preferences.theme} onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })} className="border rounded px-3 py-2 text-sm">
                    <option value="light">Light Mode</option>
                    <option value="dark">Dark Mode</option>
                  </select>
                </div>
                <div className="mt-6 text-right">
                  <button
                    onClick={savePreferences}
                    className="bg-gray-300  border border-white hover:bg-gray-300 px-6 py-2 rounded text-sm"
                    disabled={loadingPreferences}
                  >
                    {loadingPreferences ? "Saving..." : "Save Changes"}
                  </button>

                </div>
              </Card> */}
            </div>
          )}
        </div>
      </motion.div>
      {popup.open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl px-8 py-6 shadow-xl w-[320px] text-center animate-scaleIn">

            <h3
              className={`text-lg font-semibold mb-3 ${popup.type === "success"
                ? "text-green-600"
                : popup.type === "error"
                  ? "text-red-600"
                  : "text-gray-700"
                }`}
            >
              {popup.type === "success" ? "Success" : popup.type === "error" ? "Error" : "Info"}
            </h3>

            <p className="text-gray-700 mb-5">{popup.message}</p>

            <button
              onClick={() => setPopup({ ...popup, open: false })}
              className="px-5 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------- Components --------------------
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


function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-white bg-white/20 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}
