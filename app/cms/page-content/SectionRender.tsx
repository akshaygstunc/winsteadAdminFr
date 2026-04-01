/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import {
    createCustomField,
    FIELD_TYPE_OPTIONS,
    generateId,
    getDefaultValueByType,
    SECTION_DEFINITIONS,
    slugifyKey,
    SOURCE_ENTITY_OPTIONS,
    SOURCE_MODE_OPTIONS,
} from "./config";
import { getSourceItems, uploadImageFile } from "@/services/page-content.service";
import { CMSField, CMSSection } from "@/types/pageContent";

interface SectionRendererProps {
    section: CMSSection;
    index: number;
    totalSections: number;
    onUpdateSectionMeta: (sectionId: string, updates: Partial<CMSSection>) => void;
    onDeleteSection: (sectionId: string) => void;
    onMoveSection: (sectionId: string, direction: "up" | "down") => void;
    onAddField: (sectionId: string, field?: CMSField) => void;
    onUpdateField: (
        sectionId: string,
        fieldId: string,
        updates: Partial<CMSField>
    ) => void;
    onDeleteField: (sectionId: string, fieldId: string) => void;
    onUpdateSource: (
        sectionId: string,
        updates: Partial<NonNullable<CMSSection["source"]>>
    ) => void;
    onUpdateConfig: (sectionId: string, key: string, value: any) => void;
}

export default function SectionRenderer({
    section,
    index,
    totalSections,
    onUpdateSectionMeta,
    onDeleteSection,
    onMoveSection,
    onAddField,
    onUpdateField,
    onDeleteField,
    onUpdateSource,
    onUpdateConfig,
}: SectionRendererProps) {
    const definition = SECTION_DEFINITIONS[section.type];
    const [sourceOptions, setSourceOptions] = useState<
        { label: string; value: string }[]
    >([]);
    const [uploadingFieldId, setUploadingFieldId] = useState<string | null>(null);

    const supportsSource = !!definition?.supportsSource;

    const resolvedSourceEntity =
        section.source?.entity || definition?.sourceEntity || undefined;

    useEffect(() => {
        const loadSourceOptions = async () => {
            if (!supportsSource || !resolvedSourceEntity) return;
            const items = await getSourceItems(resolvedSourceEntity);
            setSourceOptions(items);
        };

        loadSourceOptions();
    }, [supportsSource, resolvedSourceEntity]);

    const configEntries = useMemo(
        () => Object.entries(section.config || {}),
        [section.config]
    );

    const handleImageUpload = async (field: CMSField, file?: File | null) => {
        if (!file) return;

        try {
            setUploadingFieldId(field.id);
            const url = await uploadImageFile(file);
            if (!url) {
                throw new Error("Image uploaded but no URL was returned");
            }

            onUpdateField(section.id, field.id, { value: url });
        } catch (error: any) {
            console.error(error);
            alert(error?.message || "Failed to upload image");
        } finally {
            setUploadingFieldId(null);
        }
    };

    const renderFieldInput = (field: CMSField) => {
        const commonClass =
            "w-full rounded-lg border border-gray-700 bg-[#111] px-3 py-2 text-sm text-white outline-none focus:border-yellow-500";

        switch (field.type) {
            case "textarea":
                return (
                    <textarea
                        value={field.value || ""}
                        placeholder={field.placeholder || ""}
                        onChange={(e) =>
                            onUpdateField(section.id, field.id, { value: e.target.value })
                        }
                        rows={4}
                        className={commonClass}
                    />
                );

            case "number":
                return (
                    <input
                        type="number"
                        value={field.value ?? 0}
                        placeholder={field.placeholder || ""}
                        onChange={(e) =>
                            onUpdateField(section.id, field.id, {
                                value: Number(e.target.value),
                            })
                        }
                        className={commonClass}
                    />
                );

            case "boolean":
                return (
                    <label className="inline-flex items-center gap-3 text-sm text-white">
                        <input
                            type="checkbox"
                            checked={!!field.value}
                            onChange={(e) =>
                                onUpdateField(section.id, field.id, { value: e.target.checked })
                            }
                        />
                        <span>Enabled</span>
                    </label>
                );

            case "select":
                return (
                    <select
                        value={field.value || ""}
                        onChange={(e) =>
                            onUpdateField(section.id, field.id, { value: e.target.value })
                        }
                        className={commonClass}
                    >
                        <option value="">Select option</option>
                        {(field.options || []).map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            case "multiselect":
                return (
                    <select
                        multiple
                        value={Array.isArray(field.value) ? field.value : []}
                        onChange={(e) => {
                            const values = Array.from(e.target.selectedOptions).map(
                                (option) => option.value
                            );
                            onUpdateField(section.id, field.id, { value: values });
                        }}
                        className={`${commonClass} min-h-[120px]`}
                    >
                        {(field.options || []).map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            case "json":
                return (
                    <textarea
                        value={
                            typeof field.value === "string"
                                ? field.value
                                : JSON.stringify(field.value ?? {}, null, 2)
                        }
                        placeholder={field.placeholder || "Enter valid JSON"}
                        onChange={(e) => {
                            const raw = e.target.value;
                            try {
                                const parsed = JSON.parse(raw);
                                onUpdateField(section.id, field.id, { value: parsed });
                            } catch {
                                onUpdateField(section.id, field.id, { value: raw });
                            }
                        }}
                        rows={8}
                        className={`${commonClass} font-mono`}
                    />
                );

            case "image":
                return (
                    <div className="space-y-3">
                        <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={(e) => handleImageUpload(field, e.target.files?.[0])}
                            className="w-full rounded-lg border border-gray-700 bg-[#111] px-3 py-2 text-sm text-white file:mr-3 file:rounded-md file:border-0 file:bg-yellow-500 file:px-3 file:py-2 file:text-sm file:font-medium file:text-black"
                        />

                        {uploadingFieldId === field.id && (
                            <p className="text-sm text-yellow-400">Uploading image...</p>
                        )}

                        {!!field.value && (
                            <div className="rounded-lg border border-gray-800 bg-[#0b0b0b] p-3">
                                <p className="mb-2 text-xs text-gray-400 break-all">
                                    {field.value}
                                </p>
                                <img
                                    src={field.value}
                                    alt={field.label || "Uploaded image"}
                                    className="h-32 w-full rounded-lg object-cover border border-gray-800"
                                />
                            </div>
                        )}
                    </div>
                );

            case "text":
            default:
                return (
                    <input
                        type="text"
                        value={field.value || ""}
                        placeholder={field.placeholder || ""}
                        onChange={(e) =>
                            onUpdateField(section.id, field.id, { value: e.target.value })
                        }
                        className={commonClass}
                    />
                );
        }
    };

    return (
        <div className="rounded-2xl border border-gray-800 bg-[#0f0f0f] p-5">
            <div className="mb-5 flex flex-col gap-4 border-b border-gray-800 pb-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm text-gray-300">
                            Section Name
                        </label>
                        <input
                            type="text"
                            value={section.name}
                            onChange={(e) =>
                                onUpdateSectionMeta(section.id, { name: e.target.value })
                            }
                            className="w-full rounded-lg border border-gray-700 bg-[#111] px-3 py-2 text-sm text-white outline-none focus:border-yellow-500"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm text-gray-300">
                            Section Type
                        </label>
                        <select
                            value={section.type}
                            onChange={(e) =>
                                onUpdateSectionMeta(section.id, { type: e.target.value })
                            }
                            className="w-full rounded-lg border border-gray-700 bg-[#111] px-3 py-2 text-sm text-white outline-none focus:border-yellow-500"
                        >
                            {Object.values(SECTION_DEFINITIONS).map((item) => (
                                <option key={item.type} value={item.type}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="flex items-center justify-between rounded-lg border border-gray-800 bg-[#111] px-3 py-3 text-sm text-white">
                            <span>Section Enabled</span>
                            <input
                                type="checkbox"
                                checked={section.enabled}
                                onChange={(e) =>
                                    onUpdateSectionMeta(section.id, { enabled: e.target.checked })
                                }
                            />
                        </label>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => onMoveSection(section.id, "up")}
                        disabled={index === 0}
                        className="rounded-lg border border-gray-700 px-3 py-2 text-sm text-white disabled:opacity-40"
                    >
                        Move Up
                    </button>
                    <button
                        type="button"
                        onClick={() => onMoveSection(section.id, "down")}
                        disabled={index === totalSections - 1}
                        className="rounded-lg border border-gray-700 px-3 py-2 text-sm text-white disabled:opacity-40"
                    >
                        Move Down
                    </button>
                    <button
                        type="button"
                        onClick={() => onDeleteSection(section.id)}
                        className="rounded-lg border border-red-700 px-3 py-2 text-sm text-red-400"
                    >
                        Delete
                    </button>
                </div>
            </div>

            {definition?.description ? (
                <p className="mb-5 text-sm text-gray-400">{definition.description}</p>
            ) : null}

            <div className="space-y-6">
                <div className="rounded-xl border border-gray-800 bg-[#111] p-4">
                    <div className="mb-4 flex items-center justify-between">
                        <h4 className="text-base font-semibold text-white">Fields</h4>
                        <button
                            type="button"
                            onClick={() => onAddField(section.id, createCustomField())}
                            className="rounded-lg bg-yellow-500 px-3 py-2 text-sm font-medium text-black"
                        >
                            Add Field
                        </button>
                    </div>

                    <div className="space-y-4">
                        {section.fields.map((field) => (
                            <div
                                key={field.id}
                                className="rounded-xl border border-gray-800 bg-[#0b0b0b] p-4"
                            >
                                <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                                    <div>
                                        <label className="mb-2 block text-xs text-gray-400">
                                            Field Label
                                        </label>
                                        <input
                                            type="text"
                                            value={field.label}
                                            onChange={(e) => {
                                                const label = e.target.value;
                                                onUpdateField(section.id, field.id, {
                                                    label,
                                                    key: field.key || slugifyKey(label),
                                                });
                                            }}
                                            className="w-full rounded-lg border border-gray-700 bg-[#111] px-3 py-2 text-sm text-white outline-none focus:border-yellow-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-xs text-gray-400">
                                            Field Key
                                        </label>
                                        <input
                                            type="text"
                                            value={field.key}
                                            onChange={(e) =>
                                                onUpdateField(section.id, field.id, {
                                                    key: slugifyKey(e.target.value),
                                                })
                                            }
                                            className="w-full rounded-lg border border-gray-700 bg-[#111] px-3 py-2 text-sm text-white outline-none focus:border-yellow-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-xs text-gray-400">
                                            Field Type
                                        </label>
                                        <select
                                            value={field.type}
                                            onChange={(e) =>
                                                onUpdateField(section.id, field.id, {
                                                    type: e.target.value as CMSField["type"],
                                                    value: getDefaultValueByType(
                                                        e.target.value as CMSField["type"]
                                                    ),
                                                })
                                            }
                                            className="w-full rounded-lg border border-gray-700 bg-[#111] px-3 py-2 text-sm text-white outline-none focus:border-yellow-500"
                                        >
                                            {FIELD_TYPE_OPTIONS.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex items-end">
                                        <button
                                            type="button"
                                            onClick={() => onDeleteField(section.id, field.id)}
                                            className="w-full rounded-lg border border-red-700 px-3 py-2 text-sm text-red-400"
                                        >
                                            Remove Field
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="mb-2 block text-xs text-gray-400">
                                        Placeholder
                                    </label>
                                    <input
                                        type="text"
                                        value={field.placeholder || ""}
                                        onChange={(e) =>
                                            onUpdateField(section.id, field.id, {
                                                placeholder: e.target.value,
                                            })
                                        }
                                        className="w-full rounded-lg border border-gray-700 bg-[#111] px-3 py-2 text-sm text-white outline-none focus:border-yellow-500"
                                    />
                                </div>

                                {(field.type === "select" || field.type === "multiselect") && (
                                    <div className="mb-4">
                                        <label className="mb-2 block text-xs text-gray-400">
                                            Options JSON
                                        </label>
                                        <textarea
                                            value={JSON.stringify(field.options || [], null, 2)}
                                            onChange={(e) => {
                                                const raw = e.target.value;
                                                try {
                                                    const parsed = JSON.parse(raw);
                                                    onUpdateField(section.id, field.id, {
                                                        options: Array.isArray(parsed) ? parsed : [],
                                                    });
                                                } catch {
                                                    // ignore malformed input here
                                                }
                                            }}
                                            rows={4}
                                            className="w-full rounded-lg border border-gray-700 bg-[#111] px-3 py-2 font-mono text-sm text-white outline-none focus:border-yellow-500"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Format: [{"{"}"label":"Option 1","value":"option-1"{"}"}]
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <label className="mb-2 block text-xs text-gray-400">
                                        Value
                                    </label>
                                    {renderFieldInput(field)}
                                </div>
                            </div>
                        ))}

                        {!section.fields.length && (
                            <div className="rounded-lg border border-dashed border-gray-700 p-4 text-sm text-gray-400">
                                No fields added yet.
                            </div>
                        )}
                    </div>
                </div>

                {supportsSource && (
                    <div className="rounded-xl border border-gray-800 bg-[#111] p-4">
                        <h4 className="mb-4 text-base font-semibold text-white">
                            Source Settings
                        </h4>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm text-gray-300">Entity</label>
                                <select
                                    value={section.source?.entity || ""}
                                    onChange={(e) =>
                                        onUpdateSource(section.id, {
                                            entity: e.target.value as NonNullable<
                                                CMSSection["source"]
                                            >["entity"],
                                        })
                                    }
                                    className="w-full rounded-lg border border-gray-700 bg-[#111] px-3 py-2 text-sm text-white outline-none focus:border-yellow-500"
                                >
                                    <option value="">Select entity</option>
                                    {SOURCE_ENTITY_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm text-gray-300">Mode</label>
                                <select
                                    value={section.source?.mode || "manual"}
                                    onChange={(e) =>
                                        onUpdateSource(section.id, {
                                            mode: e.target.value as NonNullable<
                                                CMSSection["source"]
                                            >["mode"],
                                        })
                                    }
                                    className="w-full rounded-lg border border-gray-700 bg-[#111] px-3 py-2 text-sm text-white outline-none focus:border-yellow-500"
                                >
                                    {SOURCE_MODE_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm text-gray-300">Limit</label>
                                <input
                                    type="number"
                                    value={section.source?.limit ?? 6}
                                    onChange={(e) =>
                                        onUpdateSource(section.id, {
                                            limit: Number(e.target.value),
                                        })
                                    }
                                    className="w-full rounded-lg border border-gray-700 bg-[#111] px-3 py-2 text-sm text-white outline-none focus:border-yellow-500"
                                />
                            </div>

                            {section.source?.mode === "manual" && (
                                <div className="md:col-span-2">
                                    <div className="mb-2 flex items-center justify-between">
                                        <label className="block text-sm text-gray-300">Selected Items</label>
                                        <span className="text-xs text-gray-400">
                                            {(section.source?.selectedIds || []).length}/8 selected
                                        </span>
                                    </div>

                                    <div className="max-h-72 space-y-2 overflow-y-auto rounded-lg border border-gray-700 bg-[#111] p-3">
                                        {sourceOptions.length ? (
                                            sourceOptions.map((option) => {
                                                const selectedIds = section.source?.selectedIds || [];
                                                const isChecked = selectedIds.includes(option.value);
                                                const reachedLimit = !isChecked && selectedIds.length >= 8;

                                                return (
                                                    <label
                                                        key={option.value}
                                                        className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-sm transition ${isChecked
                                                            ? "border-yellow-500 bg-yellow-500/10 text-white"
                                                            : "border-gray-800 bg-[#0b0b0b] text-gray-300"
                                                            } ${reachedLimit ? "opacity-50 cursor-not-allowed" : ""}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                disabled={reachedLimit}
                                                                onChange={() => {
                                                                    let nextSelectedIds = [...selectedIds];

                                                                    if (isChecked) {
                                                                        nextSelectedIds = nextSelectedIds.filter(
                                                                            (id) => id !== option.value
                                                                        );
                                                                    } else {
                                                                        if (nextSelectedIds.length >= 8) return;
                                                                        nextSelectedIds.push(option.value);
                                                                    }

                                                                    onUpdateSource(section.id, {
                                                                        selectedIds: nextSelectedIds,
                                                                    });
                                                                }}
                                                                className="h-4 w-4"
                                                            />
                                                            <span>{option.label}</span>
                                                        </div>

                                                        {isChecked && (
                                                            <span className="text-xs font-medium text-yellow-400">
                                                                Selected
                                                            </span>
                                                        )}
                                                    </label>
                                                );
                                            })
                                        ) : (
                                            <div className="rounded-lg border border-dashed border-gray-700 p-4 text-sm text-gray-400">
                                                No items found yet. Connect real entity API here.
                                            </div>
                                        )}
                                    </div>

                                    <p className="mt-2 text-xs text-gray-500">
                                        You can select up to 8 items.
                                    </p>
                                </div>
                            )}

                            {section.source?.mode === "filter" && (
                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm text-gray-300">
                                        Filters JSON
                                    </label>
                                    <textarea
                                        value={JSON.stringify(section.source?.filters || {}, null, 2)}
                                        onChange={(e) => {
                                            const raw = e.target.value;
                                            try {
                                                const parsed = JSON.parse(raw);
                                                onUpdateSource(section.id, { filters: parsed });
                                            } catch {
                                                onUpdateSource(section.id, { filters: raw as any });
                                            }
                                        }}
                                        rows={5}
                                        className="w-full rounded-lg border border-gray-700 bg-[#111] px-3 py-2 font-mono text-sm text-white outline-none focus:border-yellow-500"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="rounded-xl border border-gray-800 bg-[#111] p-4">
                    <div className="mb-4 flex items-center justify-between">
                        <h4 className="text-base font-semibold text-white">
                            Display / Config Settings
                        </h4>
                        <button
                            type="button"
                            onClick={() =>
                                onUpdateConfig(section.id, `config_${generateId("key")}`, "")
                            }
                            className="rounded-lg border border-gray-700 px-3 py-2 text-sm text-white"
                        >
                            Add Config Key
                        </button>
                    </div>

                    <div className="space-y-3">
                        {configEntries.map(([key, value]) => (
                            <div
                                key={key}
                                className="grid grid-cols-1 gap-3 rounded-lg border border-gray-800 bg-[#0b0b0b] p-3 md:grid-cols-[1fr_2fr]"
                            >
                                <div className="text-sm text-gray-300">{key}</div>
                                <input
                                    type="text"
                                    value={String(value ?? "")}
                                    onChange={(e) =>
                                        onUpdateConfig(section.id, key, e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-700 bg-[#111] px-3 py-2 text-sm text-white outline-none focus:border-yellow-500"
                                />
                            </div>
                        ))}

                        {!configEntries.length && (
                            <div className="rounded-lg border border-dashed border-gray-700 p-4 text-sm text-gray-400">
                                No config settings added yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}