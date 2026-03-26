"use client";

import { FaBell, FaUserCircle, FaSearch } from "react-icons/fa";

export default function Header() {
  return (
    <header className="h-[70px] border-b border-[#1A1A1A] bg-[#0B0B0C] flex items-center justify-between px-6">
      
      {/* LEFT */}
      <div className="flex items-center gap-3 bg-[#111111] px-4 py-2 rounded-xl w-[300px]">
        <FaSearch className="text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent outline-none text-sm text-white w-full"
        />
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-6">
        <FaBell className="text-gray-400 cursor-pointer" size={18} />

        <div className="flex items-center gap-2 cursor-pointer">
          <FaUserCircle size={24} className="text-[#C8A96A]" />
          <span className="text-sm">Admin</span>
        </div>
      </div>
    </header>
  );
}