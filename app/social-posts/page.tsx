"use client";

import { useEffect, useMemo, useState } from "react";
import SocialPostFormModal from "@/components/social-posts/SocialPostFormModal";
import SocialPostsTable from "@/components/social-posts/SocialPostsTable";
import {
    createSocialPost,
    deleteSocialPost,
    getSocialPosts,
    updateSocialPost,
} from "@/services/social-post.service";
import { CreateSocialPostDto, SocialPost } from "@/types/social-post";

export default function SocialPostsAdminPage() {
    const [posts, setPosts] = useState<SocialPost[]>([]);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<SocialPost | null>(null);

    const loadPosts = async () => {
        try {
            setPageLoading(true);
            const data = await getSocialPosts();
            console.log(data)
            setPosts(data?.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();
    }, []);

    const filteredPosts = useMemo(() => {
        if (!search.trim()) return posts;

        const q = search.toLowerCase();

        return posts.filter((post) => {
            return (
                post.platform.toLowerCase().includes(q) ||
                post.mediaType.toLowerCase().includes(q) ||
                (post.caption || "").toLowerCase().includes(q) ||
                (post.handle || "").toLowerCase().includes(q)
            );
        });
    }, [posts, search]);

    const handleCreate = () => {
        setEditingPost(null);
        setModalOpen(true);
    };

    const handleEdit = (post: SocialPost) => {
        setEditingPost(post);
        setModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        const confirmed = window.confirm("Are you sure you want to delete this post?");
        if (!confirmed) return;

        try {
            await deleteSocialPost(id);
            await loadPosts();
        } catch (error) {
            console.error(error);
            alert("Failed to delete post");
        }
    };

    const handleSubmit = async (data: CreateSocialPostDto) => {
        try {
            setLoading(true);

            if (editingPost) {
                await updateSocialPost(editingPost._id, data);
            } else {
                await createSocialPost(data);
            }

            setModalOpen(false);
            setEditingPost(null);
            await loadPosts();
        } catch (error) {
            console.error(error);
            alert("Failed to save post");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Social Posts</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage social media content for website display.
                    </p>
                </div>

                <button
                    onClick={handleCreate}
                    className="px-5 py-2 bg-[#C8A96A] text-black  rounded-xl"
                >
                    + Add Social Post
                </button>
            </div>

            <div className="bg-[#111111] rounded-2xl border p-4">
                <input
                    type="text"
                    placeholder="Search by platform, media type, caption, handle..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full md:w-[400px] border border-[#C8A96A] rounded-lg px-3 py-2 input"
                />
            </div>

            {pageLoading ? (
                <div className="p-10 text-center text-gray-500">Loading...</div>
            ) : (
                <SocialPostsTable
                    posts={filteredPosts}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            <SocialPostFormModal
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditingPost(null);
                }}
                onSubmit={handleSubmit}
                initialData={editingPost}
                loading={loading}
            />
        </div>
    );
}