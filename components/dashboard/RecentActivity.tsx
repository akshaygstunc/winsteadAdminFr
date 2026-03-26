export default function RecentActivity() {
  const activities = [
    {
      title: "New Vendor Added",
      desc: "Luxury Estates joined platform",
      time: "2 mins ago",
    },
    {
      title: "Project Updated",
      desc: "Palm Residency price updated",
      time: "10 mins ago",
    },
    {
      title: "New Inquiry",
      desc: "User requested brochure",
      time: "25 mins ago",
    },
    {
      title: "Vendor Approved",
      desc: "Skyline Builders approved",
      time: "1 hour ago",
    },
  ];

  return (
    <div className="bg-[#111111] p-6 rounded-2xl border border-[#1A1A1A]">
      <h2 className="text-lg mb-4">Recent Activity</h2>

      <div className="space-y-4">
        {activities.map((item, i) => (
          <div
            key={i}
            className="border-b border-[#1A1A1A] pb-3 last:border-none"
          >
            <p className="text-white text-sm">{item.title}</p>
            <p className="text-gray-400 text-xs">{item.desc}</p>
            <span className="text-gray-500 text-xs">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}