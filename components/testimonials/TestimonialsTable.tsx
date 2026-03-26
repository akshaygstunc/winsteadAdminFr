"use client";

import { FaEdit, FaTrash } from "react-icons/fa";

const data = [
  {
    id: 1,
    name: "John Doe",
    review: "Amazing experience!",
    rating: 5,
  },
];

export default function TestimonialsTable() {
  return (
    <div className="card">
      <table className="w-full text-sm">
        <thead className="text-gray-400">
          <tr>
            <th className="p-3 text-left">Name</th>
            <th>Review</th>
            <th>Rating</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {data.map((t) => (
            <tr key={t.id}>
              <td className="p-3">{t.name}</td>
              <td>{t.review}</td>
              <td>{t.rating}⭐</td>

              <td className="flex justify-end gap-3 p-3">
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