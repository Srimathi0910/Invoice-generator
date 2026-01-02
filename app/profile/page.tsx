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

const ProfilePage = () => {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [activeMenu, setActiveMenu] = useState("Profile");
  const [menuOpen, setMenuOpen] = useState(false);
  const[loading,setLoading]=useState(false)

  const [formData, setFormData] = useState({
    contactPerson: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<any>({});

  // ---------------- LOAD USER ----------------
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.replace("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setFormData({
      contactPerson: parsedUser.contactPerson || "",
      phone: parsedUser.phone || "",
      email: parsedUser.email || "",
      password: "",
      confirmPassword: "",
    });
  }, [router]);

  // ---------------- HANDLERS ----------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.clear();
    router.push("/");
  };

  // ---------------- UPDATE PROFILE ----------------
  const handleUpdate = async () => {
    const newErrors: any = {};

    if (formData.password || formData.confirmPassword) {
      if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true)

    const payload: any = {
      phone: formData.phone,
      contactPerson: formData.contactPerson,
    };
    if (formData.password) payload.password = formData.password;

    try {
      const res = await fetch("/api/auth/profile-update", {
        method: "PUT",
        credentials: "include", // important for cookies
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Update failed");

      const data = await res.json();

      const updatedUser = {
        ...user,
        phone: data.user.phone,
        contactPerson: data.user.contactPerson,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      alert("Profile updated successfully!");
      setFormData({ ...formData, password: "", confirmPassword: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  };

  // ---------------- MENU ----------------
  const menuItems = [
    { icon: <FaFileInvoiceDollar />, label: "Dashboard", path: "/dashboard-client" },
    { icon: <FaUsers />, label: "My Invoices", path: "/myInvoices" },
    { icon: <FaChartBar />, label: "Payments", path: "/payment-client" },
    { icon: <FaMoneyCheckAlt />, label: "Profile", path: "/profile" },
    { icon: <FaCog />, label: "Help", path: "/help" },
  ];

  return (
    <div className="min-h-screen bg-gray-200 p-6">
      {/* TOP BAR */}
      <div className="bg-white rounded-lg p-4 flex justify-between items-center shadow mb-6">
        <h1 className="text-xl font-bold">Invoice Dashboard</h1>
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
        </button>
        <div className={`md:flex gap-8 ${menuOpen ? "block" : "hidden md:flex"}`}>
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
          <div className="flex items-center gap-2">
            <FaUserCircle size={26} />
            <span>{user?.username || "User"}</span>
            <button onClick={handleLogout} className="text-sm text-red-600 ml-3">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* PROFILE CARD */}
      <div className="bg-white max-w-4xl mx-auto p-8 rounded shadow">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-3xl font-bold">
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <h2 className="text-2xl font-bold">{user?.username}</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Input label="Contact Person" name="contactPerson" value={formData.contactPerson} onChange={handleChange} />
            <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} />
            <Input label="Email ID" name="email" value={formData.email} readOnly />
          </div>

          <div className="space-y-4">
            <Input label="Change Password" type="password" name="password" value={formData.password} onChange={handleChange} error={errors.password} />
            <Input label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button onClick={handleUpdate} className="bg-gray-300 px-6 py-2 rounded font-medium hover:bg-gray-400">
            {loading?"Updating":"Update profile"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Input = ({ label, error, ...props }: any) => (
  <div>
    <label className="block mb-1 font-medium">{label}</label>
    <input {...props} className={`w-full border px-3 py-2 rounded ${error ? "border-red-500" : "border-gray-300"}`} />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

const MenuItem = ({ icon, label, isActive, onClick }: any) => (
  <div onClick={onClick} className={`flex items-center gap-2 cursor-pointer ${isActive ? "text-[#8F90DF] underline" : ""}`}>
    {icon} <span>{label}</span>
  </div>
);

export default ProfilePage;
