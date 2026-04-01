/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import {
    CreateSocialPostDto,
    SocialMediaType,
    SocialPlatform,
    SocialPost,
} from "@/types/social-post";

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CreateSocialPostDto) => Promise<void>;
    initialData?: SocialPost | null;
    loading?: boolean;
}

const defaultForm: CreateSocialPostDto = {
    platform: SocialPlatform.INSTAGRAM,
    mediaType: SocialMediaType.IMAGE,
    thumbnail: "",
    mediaUrl: "",
    caption: "",
    postLink: "",
    handle: "",
    publishDate: "",
    isFeatured: false,
    status: true,
    displayOrder: 0,
};

export default function SocialPostFormModal({
    open,
    onClose,
    onSubmit,
    initialData,
    loading = false,
}: Props) {
    const [form, setForm] = useState<CreateSocialPostDto>(defaultForm);

    useEffect(() => {
        if (initialData) {
            setForm({
                platform: initialData.platform,
                mediaType: initialData.mediaType,
                thumbnail: initialData.thumbnail || "",
                mediaUrl: initialData.mediaUrl || "",
                caption: initialData.caption || "",
                postLink: initialData.postLink || "",
                handle: initialData.handle || "",
                publishDate: initialData.publishDate
                    ? initialData.publishDate.slice(0, 10)
                    : "",
                isFeatured: initialData.isFeatured,
                status: initialData.status,
                displayOrder: initialData.displayOrder ?? 0,
            });
        } else {
            setForm(defaultForm);
        }
    }, [initialData, open]);

    const handleChange = (
        key: keyof CreateSocialPostDto,
        value: string | boolean | number
    ) => {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        await onSubmit({
            ...form,
            thumbnail: form.thumbnail || null,
            mediaUrl: form.mediaUrl || null,
            caption: form.caption || null,
            postLink: form.postLink || null,
            handle: form.handle || null,
            publishDate: form.publishDate || null,
            displayOrder: Number(form.displayOrder || 0),
        });
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-[#111111] w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-xl font-semibold">
                        {initialData ? "Edit Social Post" : "Create Social Post"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-sm px-3 py-1 border rounded-lg hover:bg-[#C8A96A] hover:text-black"
                    >
                        Close
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Platform</label>
                        <select
                            value={form.platform}
                            onChange={(e) =>
                                handleChange("platform", e.target.value as SocialPlatform)
                            }
                            className="w-full border rounded-lg px-3 py-2 input"
                        >
                            {Object.values(SocialPlatform).map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Media Type</label>
                        <select
                            value={form.mediaType}
                            onChange={(e) =>
                                handleChange("mediaType", e.target.value as SocialMediaType)
                            }
                            className="w-full border rounded-lg px-3 py-2 input"
                        >
                            {Object.values(SocialMediaType).map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
                        <input
                            type="text"
                            value={form.thumbnail || ""}
                            onChange={(e) => handleChange("thumbnail", e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 input"
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Media URL</label>
                        <input
                            type="text"
                            value={form.mediaUrl || ""}
                            onChange={(e) => handleChange("mediaUrl", e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 input"
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Post Link</label>
                        <input
                            type="text"
                            value={form.postLink || ""}
                            onChange={(e) => handleChange("postLink", e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 input"
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Handle</label>
                        <input
                            type="text"
                            value={form.handle || ""}
                            onChange={(e) => handleChange("handle", e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 input"
                            placeholder="@devquarters"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Publish Date</label>
                        <input
                            type="date"
                            value={form.publishDate || ""}
                            onChange={(e) => handleChange("publishDate", e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 input"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Display Order</label>
                        <input
                            type="number"
                            value={form.displayOrder ?? 0}
                            onChange={(e) => handleChange("displayOrder", Number(e.target.value))}
                            className="w-full border rounded-lg px-3 py-2 input"
                            min={0}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Caption</label>
                        <textarea
                            value={form.caption || ""}
                            onChange={(e) => handleChange("caption", e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 min-h-[120px] input"
                            placeholder="Write caption..."
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            id="featured"
                            type="checkbox"
                            checked={!!form.isFeatured}
                            onChange={(e) => handleChange("isFeatured", e.target.checked)}
                        />
                        <label htmlFor="featured" className="text-sm font-medium">
                            Featured
                        </label>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            id="status"
                            type="checkbox"
                            checked={!!form.status}
                            onChange={(e) => handleChange("status", e.target.checked)}
                        />
                        <label htmlFor="status" className="text-sm font-medium">
                            Active Status
                        </label>
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 bg-[#C8A96A] text-black rounded-lg disabled:opacity-50"
                        >
                            {loading ? "Saving..." : initialData ? "Update Post" : "Create Post"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}