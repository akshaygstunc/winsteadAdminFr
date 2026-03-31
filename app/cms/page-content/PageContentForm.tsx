/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import {
    createDefaultPageData,
    createSectionFromType,
    PAGE_OPTIONS,
    SECTION_DEFINITIONS,
    SECTION_TYPE_OPTIONS,
} from "./config";
import SeoForm from "./SeoForm";
import SectionRenderer from "./SectionRender";
import { getPageContentByKey, savePageContent } from "@/services/page-content.service";
import { CMSField, CMSSection, PageContent, PageKey, SeoData } from "@/types/pageContent";

export default function PageContentForm() {
    const [selectedPageKey, setSelectedPageKey] = useState<PageKey>("home");
    const [pageData, setPageData] = useState<PageContent>(
        createDefaultPageData("home")
    );
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<"content" | "seo">("content");
    const [newSectionType, setNewSectionType] = useState<string>("hero");

    const sortedSections = useMemo(() => {
        return [...(pageData.sections || [])].sort((a, b) => a.order - b.order);
    }, [pageData.sections]);

    useEffect(() => {
        loadPage(selectedPageKey);
    }, [selectedPageKey]);

    const normalizeSections = (sections: CMSSection[] = []) => {
        return sections.map((section, index) => ({
            ...section,
            order: typeof section.order === "number" ? section.order : index + 1,
            enabled: typeof section.enabled === "boolean" ? section.enabled : true,
            fields: Array.isArray(section.fields) ? section.fields : [],
            source: section.source || undefined,
            config: section.config || {},
        }));
    };

    const loadPage = async (pageKey: PageKey) => {
        try {
            setLoading(true);

            const data = await getPageContentByKey(pageKey);
            const defaultData = createDefaultPageData(pageKey);

            if (!data) {
                setPageData(defaultData);
                return;
            }

            setPageData({
                ...defaultData,
                ...data,
                sections: normalizeSections(data.sections || []),
                seo: {
                    ...defaultData.seo,
                    ...(data.seo || {}),
                },
            });
        } catch (error) {
            console.error("Failed to load page", error);
            setPageData(createDefaultPageData(pageKey));
        } finally {
            setLoading(false);
        }
    };

    const updateRootField = (key: keyof PageContent, value: any) => {
        setPageData((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const updateSeoField = (key: keyof SeoData, value: any) => {
        setPageData((prev) => ({
            ...prev,
            seo: {
                ...prev.seo,
                [key]: value,
            },
        }));
    };

    const updateSectionMeta = (sectionId: string, updates: Partial<CMSSection>) => {
        setPageData((prev) => ({
            ...prev,
            sections: prev.sections.map((section) => {
                if (section.id !== sectionId) return section;

                const nextType = updates.type;
                if (nextType && nextType !== section.type) {
                    const definition = SECTION_DEFINITIONS[nextType];
                    return {
                        ...section,
                        ...updates,
                        name: updates.name || definition?.label || section.name,
                        source: definition?.supportsSource
                            ? section.source || {
                                entity: definition.sourceEntity,
                                mode: "manual",
                                selectedIds: [],
                                limit: 6,
                                filters: {},
                            }
                            : undefined,
                    };
                }

                return {
                    ...section,
                    ...updates,
                };
            }),
        }));
    };

    const addSection = () => {
        setPageData((prev) => {
            const newSection = createSectionFromType(newSectionType);
            newSection.order = prev.sections.length + 1;

            return {
                ...prev,
                sections: [...prev.sections, newSection],
            };
        });
    };

    const deleteSection = (sectionId: string) => {
        setPageData((prev) => {
            const nextSections = prev.sections
                .filter((section) => section.id !== sectionId)
                .map((section, index) => ({
                    ...section,
                    order: index + 1,
                }));

            return {
                ...prev,
                sections: nextSections,
            };
        });
    };

    const moveSection = (sectionId: string, direction: "up" | "down") => {
        setPageData((prev) => {
            const sections = [...prev.sections].sort((a, b) => a.order - b.order);
            const index = sections.findIndex((section) => section.id === sectionId);

            if (index === -1) return prev;
            if (direction === "up" && index === 0) return prev;
            if (direction === "down" && index === sections.length - 1) return prev;

            const swapIndex = direction === "up" ? index - 1 : index + 1;
            [sections[index], sections[swapIndex]] = [sections[swapIndex], sections[index]];

            const reordered = sections.map((section, idx) => ({
                ...section,
                order: idx + 1,
            }));

            return {
                ...prev,
                sections: reordered,
            };
        });
    };

    const addField = (sectionId: string, field?: CMSField) => {
        setPageData((prev) => ({
            ...prev,
            sections: prev.sections.map((section) =>
                section.id === sectionId
                    ? {
                        ...section,
                        fields: [...section.fields, field as CMSField],
                    }
                    : section
            ),
        }));
    };

    const updateField = (
        sectionId: string,
        fieldId: string,
        updates: Partial<CMSField>
    ) => {
        setPageData((prev) => ({
            ...prev,
            sections: prev.sections.map((section) =>
                section.id === sectionId
                    ? {
                        ...section,
                        fields: section.fields.map((field) =>
                            field.id === fieldId ? { ...field, ...updates } : field
                        ),
                    }
                    : section
            ),
        }));
    };

    const deleteField = (sectionId: string, fieldId: string) => {
        setPageData((prev) => ({
            ...prev,
            sections: prev.sections.map((section) =>
                section.id === sectionId
                    ? {
                        ...section,
                        fields: section.fields.filter((field) => field.id !== fieldId),
                    }
                    : section
            ),
        }));
    };

    const updateSource = (
        sectionId: string,
        updates: Partial<NonNullable<CMSSection["source"]>>
    ) => {
        setPageData((prev) => ({
            ...prev,
            sections: prev.sections.map((section) =>
                section.id === sectionId
                    ? {
                        ...section,
                        source: {
                            ...(section.source || {}),
                            ...updates,
                        },
                    }
                    : section
            ),
        }));
    };

    const updateConfig = (sectionId: string, key: string, value: any) => {
        setPageData((prev) => ({
            ...prev,
            sections: prev.sections.map((section) =>
                section.id === sectionId
                    ? {
                        ...section,
                        config: {
                            ...(section.config || {}),
                            [key]: value,
                        },
                    }
                    : section
            ),
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            const sanitizedSections = [...pageData.sections]
                .sort((a, b) => a.order - b.order)
                .map((section, index) => ({
                    ...section,
                    order: index + 1,
                }));

            const saved = await savePageContent({
                ...pageData,
                sections: sanitizedSections,
            });

            setPageData((prev) => ({
                ...prev,
                ...saved,
                sections: normalizeSections(saved.sections || sanitizedSections),
            }));

            alert("Page content saved successfully");
        } catch (error: any) {
            console.error(error);
            alert(error?.message || "Failed to save page content");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-gray-800 bg-[#0f0f0f] p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-white">Page Content CMS</h1>
                        <p className="text-sm text-gray-400">
                            Dynamic page builder with source-driven sections
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 md:flex-row">
                        <select
                            value={selectedPageKey}
                            onChange={(e) => setSelectedPageKey(e.target.value as PageKey)}
                            className="rounded-lg border border-gray-700 bg-[#111] px-4 py-2 text-sm text-white outline-none focus:border-yellow-500"
                        >
                            {PAGE_OPTIONS.map((page) => (
                                <option key={page.key} value={page.key}>
                                    {page.name}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="rounded-lg bg-yellow-500 px-5 py-2 text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-60"
                        >
                            {saving ? "Saving..." : "Save Page"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
                <div className="xl:col-span-1">
                    <div className="space-y-4 rounded-2xl border border-gray-800 bg-[#0f0f0f] p-5">
                        <h2 className="text-lg font-semibold text-white">Page Settings</h2>

                        <div>
                            <label className="mb-2 block text-sm text-gray-300">Page Name</label>
                            <input
                                type="text"
                                value={pageData.pageName}
                                onChange={(e) => updateRootField("pageName", e.target.value)}
                                className="w-full rounded-lg border border-gray-700 bg-[#111] px-3 py-2 text-sm text-white outline-none focus:border-yellow-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm text-gray-300">Slug</label>
                            <input
                                type="text"
                                value={pageData.slug}
                                onChange={(e) => updateRootField("slug", e.target.value)}
                                className="w-full rounded-lg border border-gray-700 bg-[#111] px-3 py-2 text-sm text-white outline-none focus:border-yellow-500"
                            />
                        </div>

                        <label className="flex items-center justify-between rounded-lg border border-gray-800 bg-[#111] px-3 py-3 text-sm text-white">
                            <span>Page Active</span>
                            <input
                                type="checkbox"
                                checked={pageData.status}
                                onChange={(e) => updateRootField("status", e.target.checked)}
                            />
                        </label>

                        <div className="rounded-xl border border-gray-800 bg-[#111] p-3 text-xs text-gray-400">
                            <p>
                                <span className="text-gray-300">Page Key:</span> {pageData.pageKey}
                            </p>
                            <p className="mt-1">
                                <span className="text-gray-300">Sections:</span>{" "}
                                {pageData.sections.length}
                            </p>
                            <p className="mt-1">
                                <span className="text-gray-300">Last Updated:</span>{" "}
                                {pageData.updatedAt || "-"}
                            </p>
                        </div>

                        <div className="flex overflow-hidden rounded-lg border border-gray-800">
                            <button
                                onClick={() => setActiveTab("content")}
                                className={`flex-1 px-4 py-2 text-sm ${activeTab === "content"
                                    ? "bg-yellow-500 text-black"
                                    : "bg-[#111] text-white"
                                    }`}
                            >
                                Content
                            </button>
                            <button
                                onClick={() => setActiveTab("seo")}
                                className={`flex-1 px-4 py-2 text-sm ${activeTab === "seo"
                                    ? "bg-yellow-500 text-black"
                                    : "bg-[#111] text-white"
                                    }`}
                            >
                                SEO
                            </button>
                        </div>

                        {activeTab === "content" && (
                            <div className="rounded-xl border border-gray-800 bg-[#111] p-4">
                                <h3 className="mb-3 text-sm font-semibold text-white">
                                    Add New Section
                                </h3>

                                <div className="space-y-3">
                                    <select
                                        value={newSectionType}
                                        onChange={(e) => setNewSectionType(e.target.value)}
                                        className="w-full rounded-lg border border-gray-700 bg-[#111] px-3 py-2 text-sm text-white outline-none focus:border-yellow-500"
                                    >
                                        {SECTION_TYPE_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        type="button"
                                        onClick={addSection}
                                        className="w-full rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-black"
                                    >
                                        Add Section
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="xl:col-span-3">
                    {loading ? (
                        <div className="rounded-2xl border border-gray-800 bg-[#0f0f0f] p-10 text-center text-gray-400">
                            Loading page data...
                        </div>
                    ) : activeTab === "content" ? (
                        <div className="space-y-6">
                            {sortedSections.map((section, index) => (
                                <SectionRenderer
                                    key={section.id}
                                    section={section}
                                    index={index}
                                    totalSections={sortedSections.length}
                                    onUpdateSectionMeta={updateSectionMeta}
                                    onDeleteSection={deleteSection}
                                    onMoveSection={moveSection}
                                    onAddField={addField}
                                    onUpdateField={updateField}
                                    onDeleteField={deleteField}
                                    onUpdateSource={updateSource}
                                    onUpdateConfig={updateConfig}
                                />
                            ))}

                            {!sortedSections.length && (
                                <div className="rounded-2xl border border-dashed border-gray-700 bg-[#0f0f0f] p-8 text-center text-sm text-gray-400">
                                    No sections added yet. Start by adding a section from the left
                                    panel.
                                </div>
                            )}
                        </div>
                    ) : (
                        <SeoForm seo={pageData.seo} onChange={updateSeoField} />
                    )}
                </div>
            </div>
        </div>
    );
}