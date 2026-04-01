"use client";

import Image from "next/image";
import { SocialPost } from "@/types/social-post";

interface Props {
    posts: SocialPost[];
    onEdit: (post: SocialPost) => void;
    onDelete: (id: string) => void;
}

const formatDate = (date?: string | null) => {
    if (!date) return "-";

    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(date));
};

export default function SocialPostsTable({
    posts,
    onEdit,
    onDelete,
}: Props) {
    return (
        <div className="overflow-x-auto border rounded-2xl bg-[#111111]">
            <table className="w-full min-w-[1100px] text-sm">
                <thead className="bg-[#111111] border-b">
                    <tr>
                        <th className="text-left px-4 py-3">Thumb</th>
                        <th className="text-left px-4 py-3">Platform</th>
                        <th className="text-left px-4 py-3">Media Type</th>
                        <th className="text-left px-4 py-3">Caption</th>
                        <th className="text-left px-4 py-3">Handle</th>
                        <th className="text-left px-4 py-3">Publish Date</th>
                        <th className="text-left px-4 py-3">Featured</th>
                        <th className="text-left px-4 py-3">Status</th>
                        <th className="text-left px-4 py-3">Order</th>
                        <th className="text-left px-4 py-3">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <tr key={post._id} className="border-b hover:bg-[#1A1A1A] last:border-b-0">
                                <td className="px-4 py-3">
                                    {post.thumbnail ? (
                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border">
                                            <img
                                                src={post.thumbnail}
                                                alt="thumbnail"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 rounded-lg border flex items-center justify-center text-xs text-gray-400">
                                            No Image
                                        </div>
                                    )}
                                </td>

                                <td className="px-4 py-3 capitalize">{post.platform}</td>
                                <td className="px-4 py-3 capitalize">{post.mediaType}</td>
                                <td className="px-4 py-3 max-w-[260px] truncate">
                                    {post.caption || "-"}
                                </td>
                                <td className="px-4 py-3">{post.handle || "-"}</td>
                                <td className="px-4 py-3">{formatDate(post.publishDate)}</td>
                                <td className="px-4 py-3">{post.isFeatured ? "Yes" : "No"}</td>
                                <td className="px-4 py-3">{post.status ? "Active" : "Inactive"}</td>
                                <td className="px-4 py-3">{post.displayOrder}</td>

                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onEdit(post)}
                                            className="px-3 py-1 border bg-[#C8A96A] text-black rounded-lg hover:bg-gray-100"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => onDelete(post._id)}
                                            className="px-3 py-1 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                                No social posts found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}