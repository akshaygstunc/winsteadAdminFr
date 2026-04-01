"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import logo from "../../public/winstead-admin.png";
import {
  FaHome,
  FaUsers,
  FaBuilding,
  FaEnvelope,
  FaLayerGroup,
  FaCogs,
  FaImage,
  FaSearch,
  FaFileAlt,
  FaQuoteRight,
  FaBlog,
  FaAd,
  FaUserShield,
  FaBars,
} from "react-icons/fa";
import { useState } from "react";
import Image from "next/image";

const menuItems = [
  { name: "Dashboard", icon: FaHome, path: "/dashboard" },
  { name: "Vendors", icon: FaUsers, path: "/vendors" },
  { name: "Projects", icon: FaBuilding, path: "/projects" },
  { name: "Inquiries", icon: FaEnvelope, path: "/inquiries" },
  { name: "CMS", icon: FaLayerGroup, path: "/cms/homepage" },
  { name: "Categories", icon: FaLayerGroup, path: "/categories" },
  { name: "Social Media", icon: FaLayerGroup, path: "/social-posts" },
  { name: "Testimonials", icon: FaQuoteRight, path: "/testimonials" },
  { name: "Blog", icon: FaBlog, path: "/blog" },
  { name: "Settings", icon: FaCogs, path: "/settings" },
  { name: "Roles", icon: FaUserShield, path: "/roles" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* MOBILE TOGGLE */}
      <div className="lg:hidden p-4">
        <button onClick={() => setOpen(!open)}>
          <FaBars size={20} />
        </button>
      </div>

      {/* SIDEBAR */}
      <aside
        className={`fixed lg:static top-0 left-0 z-50 h-full w-[260px] bg-[#0B0B0C] border-r border-[#1A1A1A] transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* LOGO */}
        <div className="p-6 border-b border-[#1A1A1A]">
          <Image src={logo} alt="admin-logo" width={80} height={90} />{" "}
        </div>

        {/* MENU */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item, i) => {
            const isActive = pathname === item.path;

            return (
              <Link key={i} href={item.path}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all
                  ${
                    isActive
                      ? "bg-[#C8A96A] text-black"
                      : "text-gray-400 hover:bg-[#111111] hover:text-white"
                  }`}
                >
                  <item.icon size={16} />
                  <span className="text-sm">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* OVERLAY MOBILE */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}
    </>
  );
}
