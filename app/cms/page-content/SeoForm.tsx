/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { SeoData } from "@/types/pageContent";

interface SeoFormProps {
    seo: SeoData;
    onChange: (key: keyof SeoData, value: any) => void;
}

export default function SeoForm({ seo, onChange }: SeoFormProps) {
    const handleKeywordsChange = (value: string) => {
        const keywords = value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);

        onChange("metaKeywords", keywords);
    };

    return (
        <div className="rounded-2xl border border-gray-800 bg-[#0f0f0f] p-5">
            <h3 className="mb-5 text-lg font-semibold text-white">SEO Settings</h3>

            <div className="grid grid-cols-1 gap-4">
                <div>
                    <label className="mb-2 block text-sm text-gray-300">Meta Title</label>
                    <input
                        type="text"
                        value={seo?.metaTitle || ""}
                        onChange={(e) => onChange("metaTitle", e.target.value)}
                        className="w-full rounded-lg border border-gray-700 bg-[#111] px-3 py-2 text-sm text-white outline-none focus:border-yellow-500"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm text-gray-300">
                        Meta Description
                    </label>
                    <textarea
                        value={seo?.metaDescription || ""}
                        onChange={(e) => onChange("metaDescription", e.target.value)}
                        rows={4}
                        className="w-full rounded-lg border border-gray-700 bg-[#111] px-3 py-2 text-sm text-white outline-none focus:border-yellow-500"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm text-gray-300">
                        Meta Keywords
                    </label>
                    <input
                        type="text"
                        value={(seo?.metaKeywords || []).join(", ")}
                        onChange={(e) => handleKeywordsChange(e.target.value)}
                        placeholder="keyword1, keyword2, keyword3"
                        className="w-full rounded-lg border border-gray-700 bg-[#111] px-3 py-2 text-sm text-white outline-none focus:border-yellow-500"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm text-gray-300">OG Image URL</label>
                    <input
                        type="text"
                        value={seo?.ogImage || ""}
                        onChange={(e) => onChange("ogImage", e.target.value)}
                        className="w-full rounded-lg border border-gray-700 bg-[#111] px-3 py-2 text-sm text-white outline-none focus:border-yellow-500"
                    />
                </div>
            </div>
        </div>
    );
}