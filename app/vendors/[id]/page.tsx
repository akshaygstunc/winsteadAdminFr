"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getVendors } from "@/services/vendor.service";
import axios from "@/utils/axios";

export default function VendorDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ✅ FETCH SINGLE VENDOR
  const fetchVendor = async () => {
    try {
      const res = await axios.get(`/vendors/${id}`);
      setVendor(res.data.data);
    } catch (err) {
      console.error("Vendor fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchVendor();
  }, [id]);

  if (loading) return <div>Loading...</div>;

  if (!vendor) return <div>Vendor not found</div>;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center gap-4">
        <img
          src={vendor.logo || "/placeholder.png"}
          className="w-16 h-16 rounded-xl object-cover"
        />

        <div>
          <h1 className="text-2xl font-semibold">{vendor.name}</h1>
          <p className="text-gray-400 text-sm">
            {vendor.categoryId?.name || "No Category"}
          </p>
        </div>
      </div>

      {/* STATUS + FEATURED */}
      <div className="flex gap-4">
        <span
          className={`px-3 py-1 rounded-full text-xs ${
            vendor.status === "ACTIVE"
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {vendor.status}
        </span>

        <span className="px-3 py-1 rounded-full text-xs bg-[#C8A96A]/20 text-[#C8A96A]">
          {vendor.isFeatured ? "Featured" : "Not Featured"}
        </span>
      </div>

      {/* DETAILS */}
      <div className="grid md:grid-cols-2 gap-6">

        <div className="card space-y-3">
          <h2 className="font-semibold">Basic Info</h2>

          <p><b>Name:</b> {vendor.name}</p>
          <p><b>Description:</b> {vendor.description || "-"}</p>
          <p><b>Slug:</b> {vendor.slug}</p>
        </div>

        <div className="card space-y-3">
          <h2 className="font-semibold">Contact Info</h2>

          <p><b>Contact Person:</b> {vendor.contactName || "-"}</p>
          <p><b>Email:</b> {vendor.email || "-"}</p>
          <p><b>Phone:</b> {vendor.phone || "-"}</p>
          <p><b>Address:</b> {vendor.address || "-"}</p>
        </div>

      </div>

      {/* BANNER */}
      {vendor.bannerImage && (
        <div className="card">
          <h2 className="mb-2 font-semibold">Banner</h2>
          <img
            src={vendor.bannerImage}
            className="w-full h-48 object-cover rounded-xl"
          />
        </div>
      )}

      {/* META */}
      <div className="card space-y-2">
        <h2 className="font-semibold">Meta Info</h2>

        <p><b>Created By:</b> {vendor.createdBy?.name || "-"}</p>
        <p><b>Email:</b> {vendor.createdBy?.email || "-"}</p>
        <p><b>Created At:</b> {new Date(vendor.createdAt).toLocaleString()}</p>
      </div>

    </div>
  );
}