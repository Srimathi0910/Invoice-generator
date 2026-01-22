"use client";

import Link from "next/link";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaFileInvoiceDollar,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-white border-t mt-20">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* -------- Brand -------- */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FaFileInvoiceDollar className="text-[#29268E]" size={22} />
              <span className="text-lg font-semibold">Invoice Generator</span>
            </div>
            <p className="text-sm text-gray-600">
              Create, manage and track invoices with ease.
              Simple, fast and secure billing for your business.
            </p>
          </div>

          {/* -------- Quick Links -------- */}
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/dashboard" className="hover:text-[#29268E]">Dashboard</Link></li>
              <li><Link href="/company-new-invoice" className="hover:text-[#29268E]">Create Invoice</Link></li>
              <li><Link href="/clients" className="hover:text-[#29268E]">Clients</Link></li>
              <li><Link href="/reports" className="hover:text-[#29268E]">Reports</Link></li>
            </ul>
          </div>

          {/* -------- Support -------- */}
          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/help" className="hover:text-[#29268E]">Help Center</Link></li>
              <li><Link href="/faq" className="hover:text-[#29268E]">FAQs</Link></li>
              <li><Link href="/contact" className="hover:text-[#29268E]">Contact Us</Link></li>
            </ul>
          </div>

          {/* -------- Contact -------- */}
          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="flex items-center gap-2">
                <FaEnvelope /> support@invoicegen.com
              </p>
              <p className="flex items-center gap-2">
                <FaPhoneAlt /> +91 98765 43210
              </p>
            </div>
          </div>

        </div>

        {/* -------- Bottom Bar -------- */}
        <div className="border-t mt-8 pt-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Invoice Generator. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
