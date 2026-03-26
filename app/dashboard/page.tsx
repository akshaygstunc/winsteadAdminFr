import StatsCard from "@/components/ui/StatsCard";
import RecentActivity from "../../components/dashboard/RecentActivity";

export default function DashboardPage() {
  return (
    // <AdminLayout>
      <div className="space-y-6">
        
        {/* TITLE */}
        <div>
          <h1 className="text-2xl font-semibold tracking-wide">
            Dashboard Overview
          </h1>
          <p className="text-gray-400 text-sm">
            Welcome back, manage your platform efficiently.
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatsCard title="Total Vendors" value="128" growth="+12%" />
          <StatsCard title="Total Projects" value="64" growth="+8%" />
          <StatsCard title="Total Inquiries" value="342" growth="+18%" />
        </div>

        {/* LOWER GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* RECENT ACTIVITY */}
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>

          {/* QUICK STATS */}
          <div className="bg-[#111111] p-6 rounded-2xl border border-[#1A1A1A]">
            <h2 className="text-lg mb-4">Quick Insights</h2>

            <div className="space-y-4 text-sm text-gray-400">
              <div className="flex justify-between">
                <span>Active Vendors</span>
                <span className="text-white">102</span>
              </div>
              <div className="flex justify-between">
                <span>Featured Projects</span>
                <span className="text-white">18</span>
              </div>
              <div className="flex justify-between">
                <span>Pending Inquiries</span>
                <span className="text-white">27</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    // </AdminLayout>
  );
}