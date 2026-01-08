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
} from "react-icons/fa";

/* ---------------- MAIN PAGE ---------------- */
export default function SettingsPage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("Settings");
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"company" | "preferences">(
    "company"
  );

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

  /* ---------------- HANDLE CHANGES ---------------- */
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setPreferences({ ...preferences, [name]: checked });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "reminderPeriod") {
      setPreferences({ ...preferences, [name]: Number(value) });
    } else {
      setPreferences({ ...preferences, [name]: value });
    }
  };

  /* ---------------- LOAD USER ---------------- */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.replace("/login");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  /* ---------------- LOAD COMPANY SETTINGS ---------------- */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const loadCompany = async () => {
      try {
        const res = await fetch("/api/auth/company/settings", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (!res.ok) return console.error("GET failed:", res.status);

        const data = await res.json();

        setFormData((prev) => ({
          ...prev,
          companyName: data.billedBy?.businessName || "",
          email: data.billedBy?.email || "",
          phone: data.billedBy?.phone || "",
          gstin: data.billedBy?.gstin || "",
          address: data.billedBy?.address || "",
          city: data.billedBy?.city || "",
          country: data.billedBy?.country || "",
          currency: data.billedBy?.currency || "INR",
          gstRate: data.billedBy?.gstRate || 18,
          invoicePrefix: data.billedBy?.invoicePrefix || "INV-2025-",
          bankName: data.billedBy?.bankName || "",
          accountNumber: data.billedBy?.accountNumber || "",
          logoUrl: data.logoUrl || "",
        }));

        setLogoPreview(data.logoUrl || null);

        // Load preferences if available
        if (data.preferences) {
          setPreferences({
            ...preferences,
            ...data.preferences,
            reminderPeriod: Number(data.preferences.reminderPeriod) || 3,
          });
        }
      } catch (err) {
        console.error("Error loading company settings:", err);
      }
    };

    loadCompany();
  }, []);

  /* ---------------- SAVE COMPANY SETTINGS ---------------- */
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Unauthorized");

    try {
      const res = await fetch("/api/auth/company/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) alert("Settings updated successfully!");
      else alert("Error: " + data.message);
    } catch (err) {
      console.error(err);
      alert("Error saving settings");
    }
  };

  /* ---------------- SAVE PREFERENCES ---------------- */
  const savePreferences = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Unauthorized");

    try {
      const res = await fetch("/api/auth/company/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(preferences),
      });
      const data = await res.json();

      if (res.ok) alert("Preferences saved successfully!");
      else alert("Error saving preferences: " + data.message);
    } catch (err) {
      console.error("Error saving preferences:", err);
      alert("Error saving preferences");
    }
  };

  /* ---------------- LOGOUT ---------------- */
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/");
  };

  /* ---------------- MENU ITEMS ---------------- */
  const menuItems = [
    { icon: <FaFileInvoiceDollar />, label: "Invoices", path: "/dashboard" },
    { icon: <FaUsers />, label: "Clients", path: "/clients" },
    { icon: <FaChartBar />, label: "Reports", path: "/reports" },
    { icon: <FaMoneyCheckAlt />, label: "Payments", path: "/payments" },
    { icon: <FaCog />, label: "Settings", path: "/settings" },
  ];
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("/api/auth/company/preferences", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.preferences) {
          setPreferences({
            ...preferences,
            ...data.preferences,
          });
        }
      });
  }, []);
  useEffect(() => {
    if (preferences.theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, [preferences.theme]);

  return (
    <div className="min-h-screen bg-gray-200">

      {/* ---------------- NAVBAR ---------------- */}
      <div className="bg-white rounded-lg p-4 shadow mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="text-xl font-bold cursor-pointer">Dashboard</div>
          <div className="md:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
          <div
            className={`flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center w-full md:w-auto ${menuOpen ? "flex" : "hidden md:flex"
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
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded shadow">
                <FaUserCircle size={26} />
                <span className="font-medium">{user?.username || "User"}</span>
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
              className={`bg-white dark:bg-gray-900 cursor-pointer font-semibold pb-1 ${activeTab === "company"
                ? "text-[#8F90DF] underline border-purple-600"
                : "text-gray-800"
                }`}
            >
              Company Profile
            </span>
            <span
              onClick={() => setActiveTab("preferences")}
              className={`bg-white dark:bg-gray-900 cursor-pointer font-semibold pl-10 pb-1 ${activeTab === "preferences"
                ? "text-[#8F90DF] underline border-purple-600"
                : "text-gray-800"
                }`}
            >
              Preferences
            </span>
          </div>

          {/* ================= COMPANY PROFILE ================= */}
          {activeTab === "company" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card title="Company Profile">
                <div className="flex gap-4 mb-4 items-center">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 border border-dashed rounded flex items-center justify-center cursor-pointer overflow-hidden hover:bg-gray-50"
                  >
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Company Logo"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-sm text-gray-500">Logo</span>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setLogoPreview(URL.createObjectURL(file));

                      const uploadData = new FormData();
                      uploadData.append("logo", file);
                      const token = localStorage.getItem("token");
                      const res = await fetch("/api/auth/company/upload-logo", {
                        method: "POST",
                        headers: { Authorization: `Bearer ${token}` },
                        body: uploadData,
                      });
                      const data = await res.json();
                      setFormData({ ...formData, logoUrl: data.logoUrl });
                    }}
                  />

                  <input
                    className="border px-3 py-2 w-full"
                    placeholder="Company Name"
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                  />
                </div>

                <input
                  className="border px-3 py-2 w-full mb-3"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                <textarea
                  className="border px-3 py-2 w-full mb-3"
                  rows={4}
                  placeholder="Address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
                <input
                  className="border px-3 py-2 w-full mb-3"
                  placeholder="GSTIN"
                  value={formData.gstin}
                  onChange={(e) =>
                    setFormData({ ...formData, gstin: e.target.value })
                  }
                />
                <input
                  className="border px-3 py-2 w-full mb-3"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </Card>

              <Card title="Payment Settings">
                <label className="block mb-1 font-medium">Default Currency</label>
                <select
                  className="border px-3 py-2 w-full mb-4"
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                >
                  <option value="INR">Indian Rupee</option>
                  <option value="USD">USD</option>
                </select>

                <label className="block mb-1 font-medium">Default GST Rate</label>
                <select
                  className="border px-3 py-2 w-full mb-4"
                  value={formData.gstRate}
                  onChange={(e) =>
                    setFormData({ ...formData, gstRate: Number(e.target.value) })
                  }
                >
                  <option value={18}>18%</option>
                  <option value={12}>12%</option>
                  <option value={5}>5%</option>
                </select>

                <label className="block mb-1 font-medium">Invoice Number Prefix</label>
                <input
                  className="border px-3 py-2 w-full mb-6"
                  value={formData.invoicePrefix}
                  onChange={(e) =>
                    setFormData({ ...formData, invoicePrefix: e.target.value })
                  }
                />

                <button
                  className="bg-gray-300 px-6 py-2 rounded text-sm"
                  onClick={handleSave}
                >
                  Save Changes
                </button>
              </Card>
              <div className="md:col-span-2">
                <Card title="Bank Information" >
                  <label className="block mb-1 font-medium">Bank Name</label>
                  <input
                    className="border px-3 py-2 w-full mb-4"
                    placeholder="Bank Name"
                    value={formData.bankName}
                    onChange={(e) =>
                      setFormData({ ...formData, bankName: e.target.value })
                    }
                  />

                  <label className="block mb-1 font-medium">Account Number</label>
                  <input
                    className="border px-3 py-2 w-full mb-4"
                    placeholder="Account Number"
                    value={formData.accountNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, accountNumber: e.target.value })
                    }
                  />

                  <label className="block mb-1 font-medium">UPI ID (Optional)</label>
                  <input
                    className="border px-3 py-2 w-full mb-6"
                    placeholder="example@upi"
                    value={formData.upiId}
                    onChange={(e) =>
                      setFormData({ ...formData, upiId: e.target.value })
                    }
                  />

                  <button
                    className="bg-gray-300 px-6 py-2 rounded text-sm"
                    onClick={handleSave}
                  >
                    Save Bank Details
                  </button>
                </Card>
              </div>
            </div>

          )}

          {/* ================= PREFERENCES ================= */}
          {activeTab === "preferences" && (
            <div>
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-lg font-semibold mb-4">Notifications Preferences</h2>

                <div className="space-y-3">
                  {["dueDateReminder", "overdueAlert", "paymentReceived"].map((field) => (
                    <label className="flex items-center gap-3" key={field}>
                      <input
                        type="checkbox"
                        name={field}
                        checked={preferences[field as keyof typeof preferences] as boolean}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4"
                      />
                      <span>{field === "dueDateReminder" ? "Due Date Reminder" : field === "overdueAlert" ? "Overdue Invoice Alert" : "Payment Received Notification"}</span>
                    </label>
                  ))}
                </div>

                <div className="mt-6 flex items-center gap-4">
                  <span className="text-sm text-gray-600">Reminder Period:</span>
                  <select
                    name="reminderPeriod"
                    value={preferences.reminderPeriod}
                    onChange={handleSelectChange}
                    className="border rounded px-3 py-2 text-sm"
                  >
                    {[1, 3, 5].map((day) => (
                      <option key={day} value={day}>{day} Day{day > 1 ? "s" : ""} Before Due Date</option>
                    ))}
                  </select>
                </div>

                <div className="mt-6 text-right">
                  <button
                    onClick={savePreferences}
                    className="bg-gray-200 hover:bg-gray-300 px-6 py-2 rounded text-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Appearance Preferences</h2>
                <div className="flex items-center gap-4">
                  <span className="bg-white dark:bg-gray-900 text-sm text-gray-600">Theme:</span>
                  <select
                    name="theme"
                    value={preferences.theme}
                    onChange={handleSelectChange}
                    className="border rounded px-3 py-2 text-sm"
                  >
                    <option value="light">Light Mode</option>
                    {/* <option value="dark">Dark Mode</option> */}
                  </select>
                </div>

                <div className="mt-6 text-right">
                  <button
                    onClick={savePreferences}
                    className="bg-gray-200 hover:bg-gray-300 px-6 py-2 rounded text-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
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
    className={`bg-white dark:bg-gray-900 flex gap-2 items-center cursor-pointer ${isActive ? "text-[#8F90DF] underline" : "text-black"
      }`}
  >
    {icon}
    <span>{label}</span>
  </div>
);

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}
