import { FaArrowUp } from "react-icons/fa";

export default function StatsCard({ title, value, growth }: any) {
  return (
    <div className="bg-[#111111] p-6 rounded-2xl border border-[#1A1A1A] hover:border-[#C8A96A] transition-all">
      
      <p className="text-gray-400 text-sm">{title}</p>

      <div className="flex items-center justify-between mt-3">
        <h2 className="text-2xl font-semibold">{value}</h2>

        <div className="flex items-center gap-1 text-green-400 text-sm">
          <FaArrowUp size={12} />
          {growth}
        </div>
      </div>
    </div>
  );
}