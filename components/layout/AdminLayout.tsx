import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AdminLayout({ children }: any) {
  return (
    <div className="flex bg-[#0B0B0C] text-white min-h-screen">
      <Sidebar />

      <div className="flex-1">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}