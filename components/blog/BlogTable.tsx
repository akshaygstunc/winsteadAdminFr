"use client";

import { FaEdit, FaTrash } from "react-icons/fa";

const blogs = [
  {
    id: 1,
    title: "Luxury Living in Mumbai",
    status: "Published",
  },
];

export default function BlogTable() {
  return (
    <div className="card">
      <table className="w-full text-sm">
        <thead className="text-gray-400">
          <tr>
            <th className="p-3 text-left">Title</th>
            <th>Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {blogs.map((b) => (
            <tr key={b.id}>
              <td className="p-3">{b.title}</td>
              <td>{b.status}</td>

              <td className="text-right flex justify-end gap-3 p-3">
                <FaEdit />
                <FaTrash className="text-red-400" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}