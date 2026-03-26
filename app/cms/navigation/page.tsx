"use client";

import NavigationManager from "@/components/cms/navigation/NavigationManager";


export default function NavigationPage() {
  return (
      <div className="space-y-6">
        <h1 className="text-2xl">Navigation Menu</h1>
        <NavigationManager />
      </div>
  );
}