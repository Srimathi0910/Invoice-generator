"use client";

import { useState, useEffect } from "react";
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
} from "react-icons/fa";

/* ---------------- MAIN PAGE ---------------- */

export default function SettingsPage() {
  const router = useRouter();

  const [activeMenu, setActiveMenu] = useState("Settings");
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);

  // 👉 TAB STATE
  const [activeTab, setActiveTab] = useState<"company" | "preferences">(
    "company"
  );

  const menuItems = [
    { icon: <FaFileInvoiceDollar />, label: "Invoices", path: "/invoices" },
    { icon: <FaUsers />, label: "Clients", path: "/clients" },
    { icon: <FaChartBar />, label: "Reports", path: "/reports" },
    { icon: <FaMoneyCheckAlt />, label: "Payments", path: "/payments" },
    { icon: <FaCog />, label: "Settings", path: "/settings" },
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.replace("/login");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-200">
      {/* ---------------- NAVBAR ---------------- */}
      <div className="bg-white rounded-lg p-4 shadow mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="text-xl font-bold cursor-pointer" />

          {/* Mobile Toggle */}
          <div className="md:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>

          {/* Menu */}
          <div
            className={`flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center w-full md:w-auto ${
              menuOpen ? "flex" : "hidden md:flex"
            }`}
          >
            {menuItems.map((item) => (
              <MenuItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                isActive={activeMenu === item.label}
                onClick={() => {
                  setActiveMenu(item.label);
                  router.push(item.path);
                }}
              />
            ))}

            {/* User */}
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded shadow">
                <FaUserCircle size={26} />
                <span className="font-medium">
                  {user?.username || "User"}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:underline mt-1"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- PAGE CONTENT ---------------- */}
      <div className="px-4 sm:px-6 md:px-10 lg:px-16 py-8">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <div className="bg-white rounded-xl p-6 sm:p-8">
          {/* -------- Tabs -------- */}
          <div className="flex gap-10 mb-8">
            <span
              onClick={() => setActiveTab("company")}
              className={`cursor-pointer font-semibold pb-1 ${
                activeTab === "company"
                  ? "text-[#8F90DF] underline border-purple-600"
                  : "text-gray-800"
              }`}
            >
              Company Profile
            </span>

            <span
              onClick={() => setActiveTab("preferences")}
              className={`cursor-pointer font-semibold pl-10 pb-1 ${
                activeTab === "preferences"
                  ? "text-[#8F90DF] underline border-purple-600"
                  : "text-gray-800"
              }`}
            >
              Preferences
            </span>
          </div>

          {/* ================= COMPANY PROFILE ================= */}
          {activeTab === "company" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card title="Company Profile">
                  <div className="flex gap-4 mb-4">
                    <div className="w-20 h-20 border border-dashed flex items-center justify-center">
                      Logo
                    </div>
                    <input
                      className="border px-3 py-2 w-full"
                      placeholder="Enter your company name"
                    />
                  </div>

                  <input
                    className="border px-3 py-2 w-full mb-3"
                    placeholder="Enter your Email Id"
                  />

                  <textarea
                    className="border px-3 py-2 w-full mb-3"
                    rows={4}
                    placeholder="Enter your Address"
                  />

                  <label className="text-sm font-medium">GSTIN</label>
                  <input className="border px-3 py-2 w-full mb-3" />

                  <p className="text-sm mb-2">Status Code: 33</p>
                  <p className="text-sm">
                    <span className="font-medium">UPI ID:</span>{" "}
                    abcsolutions@upi
                  </p>
                </Card>

                <Card title="Payment Settings">
                  <label className="block mb-1 font-medium">
                    Default Currency
                  </label>
                  <select className="border px-3 py-2 w-full mb-4">
                    <option>Indian Rupee</option>
                  </select>

                  <label className="block mb-1 font-medium">
                    Default GST Rate
                  </label>
                  <select className="border px-3 py-2 w-full mb-4">
                    <option>18%</option>
                    <option>12%</option>
                    <option>5%</option>
                  </select>

                  <label className="block mb-1 font-medium">
                    Invoice Number Prefix
                  </label>
                  <select className="border px-3 py-2 w-full mb-6">
                    <option>INV-2025-</option>
                  </select>

                  <button className="bg-gray-300 px-6 py-2 rounded text-sm">
                    Save Changes
                  </button>
                </Card>
              </div>

              <div className="mt-8">
                <Card title="Bank Information">
                  <p className="mb-2">
                    <span className="font-medium">Bank Name:</span> State Bank
                  </p>
                  <p className="mb-4">
                    <span className="font-medium">Account Number:</span>{" "}
                    123467890
                  </p>

                  <button className="bg-gray-300 px-6 py-2 rounded text-sm">
                    Save Changes
                  </button>
                </Card>
              </div>
            </>
          )}

          {/* ================= PREFERENCES ================= */}
          {activeTab === "preferences" && (
            <div className="space-y-8">
              <Card title="Notification Preferences">
                <div className="space-y-3">
                  <label className="flex gap-2 items-center">
                    <input type="checkbox" defaultChecked />
                    Due Date Reminder
                  </label>

                  <label className="flex gap-2 items-center">
                    <input type="checkbox" defaultChecked />
                    Overdue Invoice Alert
                  </label>

                  <label className="flex gap-2 items-center">
                    <input type="checkbox" defaultChecked />
                    Payment Received Notification
                  </label>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <span className="font-medium">Reminder Period:</span>
                  <select className="border px-3 py-2">
                    <option>3 Days Before Due Date</option>
                    <option>5 Days Before Due Date</option>
                    <option>On Due Date</option>
                  </select>
                </div>

                <button className="mt-4 bg-gray-300 px-6 py-2 rounded text-sm">
                  Save Changes
                </button>
              </Card>

              <Card title="Appearance Preferences">
                <label className="block mb-2 font-medium">Theme</label>
                <select className="border px-3 py-2 w-48">
                  <option>Light Mode</option>
                  <option>Dark Mode</option>
                </select>

                <button className="mt-4 bg-gray-300 px-6 py-2 rounded text-sm">
                  Save Changes
                </button>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

const MenuItem = ({ icon, label, isActive, onClick }: any) => (
  <div
    onClick={onClick}
    className={`flex gap-2 items-center cursor-pointer ${
      isActive ? "text-[#8F90DF] underline" : "text-black"
    }`}
  >
    {icon}
    <span>{label}</span>
  </div>
);

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}
