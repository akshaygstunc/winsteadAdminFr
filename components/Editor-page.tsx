'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Header } from '@/components/header';
import { api } from '@/lib/api';
import { CmsConfig, CmsField, CmsItem } from '@/lib/cms';
import { ActionButton, SectionCard, StatusBadge } from '@/components/ui';
import {
    FieldLabel,
    FormActions,
    InlineActions,
    SectionNotice,
    SelectInput,
    TextArea,
    TextInput,
} from '@/components/crud-kit';
import { TiptapEditor } from './TextEditor';

type RelationOption = {
    label: string;
    value: string;
};

type RelationOptionsMap = Record<string, RelationOption[]>;

function blankFromConfig(config: CmsConfig): CmsItem {
    const data: Record<string, any> = {};

    for (const field of config.fields) {
        if (
            ['title', 'subtitle', 'slug', 'status', 'image', 'description', 'sortOrder'].includes(field.key)
        )
            continue;

        if (field.type === 'boolean') data[field.key] = false;
        else if (field.type === 'number') data[field.key] = 0;
        else if (field.type === 'multiselect') data[field.key] = [];
        else if (field.type === 'relation-select' && (field as any).multiple) data[field.key] = [];
        else data[field.key] = '';
    }

    return {
        title: '',
        subtitle: '',
        slug: '',
        status: 'draft',
        image: '',
        description: '',
        sortOrder: 0,
        data,
    };
}

function getValue(item: CmsItem, field: CmsField) {
    if (field.key in item) return (item as any)[field.key];
    return item.data?.[field.key];
}

function setValue(item: CmsItem, field: CmsField, value: any): CmsItem {
    if (
        field.key in item ||
        ['title', 'subtitle', 'slug', 'status', 'image', 'description', 'sortOrder'].includes(field.key)
    ) {
        return { ...item, [field.key]: value };
    }

    return {
        ...item,
        data: { ...(item.data || {}), [field.key]: value },
    };
}

async function fileToDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
const uploadAsset = async (file: File) => {
    try {
        const formData = new FormData()
        formData.append('file', file);
        const data = await api.post<any[]>(
            `/content/upload/gallery`,
            formData,

        );

        return data?.data?.url;
    } catch {
        alert('Failed to upload asset.');
        return null;
    }
}
function normalizeRelationOptions(
    rows: any[],
    labelKey: string,
    valueKey: string,
): RelationOption[] {
    return rows.map((row) => ({
        label: row?.[labelKey] ?? 'Untitled',
        value: String(row?.[valueKey] ?? ''),
    }));
}

function renderField(
    field: CmsField,
    value: any,
    onChange: (value: any) => void,
    relationOptions: RelationOptionsMap = {},
) {
    switch (field.type) {
        case 'textarea':
            return (
                <TextArea
                    label={field.label}
                    value={value || ''}
                    onChange={onChange}
                    rows={field.key.toLowerCase().includes('body') ? 5 : 4}
                />
            );
        case 'editor':
            return (
                <TiptapEditor
                    label={field.label}
                    value={value || ''}
                    onChange={onChange}
                    note={field.note}
                />
            );
        case 'select':
            return (
                <SelectInput
                    label={field.label}
                    value={value || ''}
                    onChange={onChange}
                    options={field.options || []}
                />
            );

        case 'relation-select': {
            const options = relationOptions[field.key] || [];
            const isMultiple = Boolean((field as any).multiple);

            if (isMultiple) {
                const selected = Array.isArray(value) ? value.map(String) : [];

                return (
                    <div>
                        <FieldLabel label={field.label} />
                        <div className="grid gap-2 sm:grid-cols-2">
                            {options.map((option) => (
                                <label
                                    key={option.value}
                                    className="flex items-center gap-2 rounded-2xl border border-line bg-panel px-3 py-2 text-sm text-text"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(option.value)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                onChange([...selected, option.value]);
                                            } else {
                                                onChange(selected.filter((v) => v !== option.value));
                                            }
                                        }}
                                    />
                                    <span>{option.label}</span>
                                </label>
                            ))}
                        </div>

                        {!options.length ? (
                            <p className="mt-2 text-xs text-muted">No options available.</p>
                        ) : null}

                        {field.note ? <p className="mt-2 text-xs text-muted">{field.note}</p> : null}
                    </div>
                );
            }

            return (
                <div>
                    <SelectInput
                        label={field.label}
                        value={value || ''}
                        onChange={onChange}
                        options={[
                            { label: `Select ${field.label}`, value: '' },
                            ...options,
                        ]}
                    />
                    {!options.length ? (
                        <p className="mt-2 text-xs text-muted">No options available.</p>
                    ) : null}
                    {field.note ? <p className="mt-2 text-xs text-muted">{field.note}</p> : null}
                </div>
            );
        }

        case 'number':
            return (
                <TextInput
                    label={field.label}
                    type="number"
                    value={value ?? 0}
                    onChange={(v) => onChange(Number(v))}
                />
            );

        case 'date':
            return <TextInput label={field.label} type="date" value={value || ''} onChange={onChange} />;

        case 'boolean':
            return (
                <div>
                    <FieldLabel label={field.label} />
                    <label className="flex items-center gap-3 rounded-2xl border border-line bg-panel px-4 py-3 text-sm text-text">
                        <input
                            type="checkbox"
                            checked={Boolean(value)}
                            onChange={(e) => onChange(e.target.checked)}
                        />
                        <span>Enabled</span>
                    </label>
                </div>
            );

        case 'multiselect': {
            const selected = Array.isArray(value) ? value : [];

            return (
                <div>
                    <FieldLabel label={field.label} />
                    <div className="grid gap-2 sm:grid-cols-2">
                        {(field.options || []).map((option) => (
                            <label
                                key={option.value}
                                className="flex items-center gap-2 rounded-2xl border border-line bg-panel px-3 py-2 text-sm text-text"
                            >
                                <input
                                    type="checkbox"
                                    checked={selected.includes(option.value)}
                                    onChange={(e) =>
                                        onChange(
                                            e.target.checked
                                                ? [...selected, option.value]
                                                : selected.filter((v: string) => v !== option.value),
                                        )
                                    }
                                />
                                <span>{option.label}</span>
                            </label>
                        ))}
                    </div>
                    {field.note ? <p className="mt-2 text-xs text-muted">{field.note}</p> : null}
                </div>
            );
        }

        case 'icon':
            return (
                <div>
                    <FieldLabel label={field.label} />
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {[
                            'building-2',
                            'map-pin',
                            'star',
                            'home',
                            'users',
                            'images',
                            'briefcase-business',
                            'badge-dollar-sign',
                        ].map((icon) => (
                            <button
                                key={icon}
                                type="button"
                                onClick={() => onChange(icon)}
                                className={`rounded-2xl border px-3 py-3 text-sm ${value === icon
                                    ? 'border-gold bg-gold/10 text-gold'
                                    : 'border-line bg-panel text-text'
                                    }`}
                            >
                                {icon}
                            </button>
                        ))}
                    </div>
                    {field.note ? <p className="mt-2 text-xs text-muted">{field.note}</p> : null}
                </div>
            );

        case 'video':
        case 'image':
            return (
                <div className="space-y-3">
                    <TextInput
                        label={field.label}
                        value={value || ''}
                        onChange={onChange}
                        placeholder="Paste image URL or upload below"
                    />
                    <div>
                        <FieldLabel label={`${field.label} Upload`} />
                        <input
                            className="input"
                            type="file"
                            accept={field.type === 'video' ? 'video/mp4' : 'image/*'}
                            onChange={async (e: ChangeEvent<HTMLInputElement>) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const dataUrl = await uploadAsset(file);
                                onChange(dataUrl);
                            }}
                        />
                    </div>
                    {field.note ? <p className="text-xs text-muted">{field.note}</p> : null}
                    {value
                        ? field.type === 'video'
                            ? (
                                <video
                                    src={value}
                                    controls
                                    className="h-36 w-full rounded-2xl border border-line object-cover"
                                />
                            )
                            : (
                                <img
                                    src={value}
                                    alt={field.label}
                                    className="h-36 w-full rounded-2xl border border-line object-cover"
                                />
                            )
                        : null}
                </div>
            );

        default:
            return (
                <div>
                    <TextInput label={field.label} value={value || ''} onChange={onChange} />
                    {field.note ? <p className="mt-2 text-xs text-muted">{field.note}</p> : null}
                </div>
            );
    }
}

export function EditorCmsPage({ config }: { config: CmsConfig }) {
    const [items, setItems] = useState<CmsItem[]>([]);
    const [form, setForm] = useState<CmsItem>(blankFromConfig(config));
    const [editingId, setEditingId] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [relationOptions, setRelationOptions] = useState<RelationOptionsMap>({});

    const leftFields = useMemo(
        () =>
            config.fields.filter(
                (f) =>
                    ['title', 'subtitle', 'slug', 'image', 'description', 'videoUrl'].includes(f.key) ||
                    f.type === 'textarea',
            ),
        [config],
    );

    const rightFields = useMemo(
        () => config.fields.filter((f) => !leftFields.includes(f)),
        [config, leftFields],
    );

    const loadRelations = async () => {
        try {
            const relationFields = config.fields.filter((field) => field.type === 'relation-select');

            if (!relationFields.length) return;

            const results = await Promise.all(
                relationFields.map(async (field) => {
                    const relation = (field as any).relation;
                    if (!relation?.entity) return { key: field.key, options: [] as RelationOption[] };

                    const rows = await api.get<any[]>(`/${relation.entity}`);
                    const options = normalizeRelationOptions(
                        Array.isArray(rows) ? rows : [],
                        relation.labelKey || 'title',
                        relation.valueKey || '_id',
                    );

                    return { key: field.key, options };
                }),
            );

            const mapped: RelationOptionsMap = {};
            for (const item of results) mapped[item.key] = item.options;

            setRelationOptions(mapped);
        } catch (err) {
            console.error('Failed to load relation options:', err);
        }
    };

    const load = async (term = '') => {
        try {
            const rows = await api.get<CmsItem[]>(
                `/content/${config.entity}${term ? `?search=${encodeURIComponent(term)}` : ''}`,
            );
            setItems(rows);

            if (!editingId && rows[0]) {
                setForm({
                    ...blankFromConfig(config),
                    ...rows[0],
                    data: {
                        ...blankFromConfig(config).data,
                        ...(rows[0].data || {}),
                    },
                });
            }
        } catch {
            setError('Failed to load records.');
        }
    };

    useEffect(() => {
        load();
        loadRelations();
    }, [config.entity]);

    const reset = () => {
        setEditingId(null);
        setForm(blankFromConfig(config));
    };

    const edit = (item: CmsItem) => {
        setEditingId(item._id || null);
        setForm({
            ...blankFromConfig(config),
            ...item,
            data: {
                ...blankFromConfig(config).data,
                ...(item.data || {}),
            },
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const submit = async () => {
        try {
            const payload = {
                ...form,
                slug:
                    form.slug ||
                    form.title
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)+/g, ''),
            };

            if (editingId) {
                await api.patch(`/content/${config.entity}/${editingId}`, payload);
            } else {
                await api.post(`/content/${config.entity}`, payload);
            }

            setMessage(editingId ? 'Updated successfully.' : 'Created successfully.');
            setError(null);
            reset();
            await load(search);
        } catch {
            setError('Unable to save record.');
            setMessage(null);
        }
    };

    const remove = async (id?: string) => {
        if (!id) return;

        try {
            await api.delete(`/content/${config.entity}/${id}`);
            setMessage('Deleted successfully.');
            setError(null);

            if (editingId === id) reset();
            await load(search);
        } catch {
            setError('Unable to delete record.');
            setMessage(null);
        }
    };

    return (
        <DashboardShell>
            <Header title={config.title} subtitle={config.subtitle} />

            <div className="space-y-6">
                <SectionNotice message={message} error={error} />

                <SectionCard
                    title={editingId ? `Edit ${config.title.slice(0, -1) || config.title}` : config.addLabel || `Add ${config.title}`}
                    subtitle="Full-page editor flow with content area on the left and SEO/settings panel on the right."
                    action={
                        <div className="flex gap-3">
                            <ActionButton secondary onClick={reset}>Reset</ActionButton>
                            <ActionButton onClick={submit}>{editingId ? 'Update' : 'Save'}</ActionButton>
                        </div>
                    }
                >
                    <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
                        <div className="space-y-5">
                            {leftFields.map((field) => (
                                <div key={field.key}>
                                    {renderField(
                                        field,
                                        getValue(form, field),
                                        (value) => setForm((prev) => setValue(prev, field, value)),
                                        relationOptions,
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 rounded-[28px] border border-line bg-panel/50 p-4">
                            <p className="text-xs uppercase tracking-[0.24em] text-gold">Meta & Settings</p>

                            {rightFields.map((field) => (
                                <div key={field.key}>
                                    {renderField(
                                        field,
                                        getValue(form, field),
                                        (value) => setForm((prev) => setValue(prev, field, value)),
                                        relationOptions,
                                    )}
                                </div>
                            ))}

                            <FormActions
                                onSubmit={submit}
                                onCancel={reset}
                                submitLabel={editingId ? 'Update Record' : 'Create Record'}
                            />
                        </div>
                    </div>
                </SectionCard>

                <SectionCard
                    title={`${config.title} Listing`}
                    subtitle="Search, review, edit, and remove saved records."
                >
                    <div className="mb-5 flex flex-wrap gap-3">
                        <input
                            className="input w-72"
                            placeholder={config.searchPlaceholder || 'Search'}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') load(search);
                            }}
                        />
                        <ActionButton secondary onClick={() => load(search)}>Search</ActionButton>
                    </div>

                    <div className="space-y-3">
                        {items.map((item) => (
                            <div
                                key={item._id || item.title}
                                className="grid gap-4 rounded-[28px] border border-line bg-panel/60 p-4 xl:grid-cols-[140px_1fr_auto] xl:items-center"
                            >
                                <div className="h-28 overflow-hidden rounded-[22px] border border-line bg-card">
                                    {item.image ? (
                                        <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full bg-gradient-to-br from-violet-500/15 to-gold/10" />
                                    )}
                                </div>

                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-base font-semibold text-text">{item.title}</h3>
                                        <StatusBadge
                                            value={item.status || 'draft'}
                                            tone={item.status === 'active' || item.status === 'published' ? 'green' : 'slate'}
                                        />
                                    </div>

                                    {item.subtitle ? <p className="mt-2 text-sm text-muted">{item.subtitle}</p> : null}
                                    {item.slug ? <p className="mt-2 text-xs text-muted">/{item.slug}</p> : null}
                                    {item.description ? (
                                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{item.description}</p>
                                    ) : null}
                                </div>

                                <div className="justify-self-end">
                                    <InlineActions onEdit={() => edit(item)} onDelete={() => remove(item._id)} />
                                </div>
                            </div>
                        ))}

                        {!items.length ? (
                            <div className="rounded-3xl border border-dashed border-line p-8 text-sm text-muted">
                                No records found.
                            </div>
                        ) : null}
                    </div>
                </SectionCard>
            </div>
        </DashboardShell>
    );
}