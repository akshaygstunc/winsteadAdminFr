"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; "@tanstack/react-query"
export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const queryClient = new QueryClient();
  // 🚫 Pages where layout should NOT appear
  const noLayoutRoutes = ["/login", "/register"];

  const isAuthPage = noLayoutRoutes.includes(pathname);

  if (isAuthPage) {
    return <>{children}</>; // 🔥 NO sidebar/header
  }

  return (
    <div className="flex bg-[#0B0B0C] text-white min-h-screen">
      <QueryClientProvider client={queryClient}>
      <Sidebar />

      <div className="flex-1">
        <Header />
        <main className="p-6">{children}</main>
      </div>
      </QueryClientProvider>
    </div>
  );
}