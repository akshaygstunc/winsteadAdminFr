"use client";

import SettingsForm from "@/components/settings/SettingsForm";


export default function SettingsPage() {
  return (
      <div className="space-y-6">
        <h1 className="text-2xl">Global Settings</h1>
        <SettingsForm />
      </div>
  );
}