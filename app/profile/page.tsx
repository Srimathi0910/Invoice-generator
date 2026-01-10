"use client";
import { authFetch} from "@/utils/authFetch"; 
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
import { motion, Variants } from "framer-motion";
import TetrominosLoader from "../_components/TetrominosLoader";

const ProfilePage = () => {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [activeMenu, setActiveMenu] = useState("Profile");
  const [menuOpen, setMenuOpen] = useState(false);
  const[loading,setLoading]=useState(false);
    const [showLoader, setShowLoader] = useState(true);
    useEffect(() => {
      
      const timer = setTimeout(() => {
        setShowLoader(false);
      }, 1200); 
  
      return () => clearTimeout(timer); // cleanup
    }, []);

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
  const data = await authFetch("/api/auth/profile-update", {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!data?.user) {
    throw new Error("Invalid response");
  }

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
} finally {
  setLoading(false);
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
 // Navbar slides from top
  const navbarVariants: Variants = {
    hidden: { y: -100, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
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
const itemVariant: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" },
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
  animate="visible" className="min-h-screen bg-gray-200 p-6">
      {/* TOP BAR */}
      <motion.div
        variants={navbarVariants}
        initial="hidden"
        animate="visible"
        className="bg-white dark:bg-gray-900 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 shadow"
      >



        <motion.div variants={itemVariant} className="text-xl font-bold cursor-pointer mb-3 md:mb-0">
          {/* LOGO */}
        </motion.div>

        <motion.div variants={itemVariant} className="md:hidden flex items-center mb-3">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </motion.div>

        <motion.div variants={itemVariant}
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
            <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded shadow">
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
        </motion.div>
      </motion.div>

      {/* PROFILE CARD */}
      <motion.div variants={itemVariant} className="bg-white max-w-4xl mx-auto p-8 rounded shadow">
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
      </motion.div>
    </motion.div>
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
