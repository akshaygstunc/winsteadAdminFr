"use client";

import BannerForm from "@/components/banners/BannerForm";

export default function BannersPage() {
  return (
      <div className="space-y-6">
        <h1 className="text-2xl">Banner Management</h1>
        <BannerForm />
      </div>
  );
}