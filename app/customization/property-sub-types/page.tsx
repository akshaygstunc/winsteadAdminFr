'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Header } from '@/components/header';
import { api } from '@/lib/api';
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

type PropertyTypeOption = {
  _id: string;
  title: string;
  slug: string;
};

type PropertySubTypeItem = {
  _id?: string;
  title: string;
  slug: string;
  propertyTypeId: string | { _id: string; title: string; slug: string };
  description?: string;
  icon?: string;
  image?: string;
  status: 'active' | 'inactive';
  sortOrder?: number;
  isFeatured?: boolean;
  data?: Record<string, any>;
};

const blankForm: PropertySubTypeItem = {
  title: '',
  slug: '',
  propertyTypeId: '',
  description: '',
  icon: '',
  image: '',
  status: 'active',
  sortOrder: 0,
  isFeatured: false,
  data: {},
};

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export default function PropertySubTypesPage() {
  const [items, setItems] = useState<PropertySubTypeItem[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyTypeOption[]>([]);
  const [form, setForm] = useState<PropertySubTypeItem>(blankForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const propertyTypeOptions = useMemo(
    () =>
      propertyTypes.map((item) => ({
        label: item.title,
        value: item._id,
      })),
    [propertyTypes],
  );

  const loadPropertyTypes = async () => {
    try {
      const rows = await api.get<PropertyTypeOption[]>('/content/property-types');
      setPropertyTypes(rows);
    } catch {
      setError('Failed to load property types.');
    }
  };

  const load = async (term = '') => {
    try {
      const rows = await api.get<PropertySubTypeItem[]>(
        `/content/property-sub-types${term ? `?search=${encodeURIComponent(term)}` : ''}`,
      );
      setItems(rows);
    } catch {
      setError('Failed to load property sub-types.');
    }
  };

  useEffect(() => {
    load();
    loadPropertyTypes();
  }, []);

  const reset = () => {
    setEditingId(null);
    setForm(blankForm);
    setError(null);
    setMessage(null);
  };

  const edit = (item: PropertySubTypeItem) => {
    setEditingId(item._id || null);
    setForm({
      ...blankForm,
      ...item,
      propertyTypeId:
        typeof item.propertyTypeId === 'string'
          ? item.propertyTypeId
          : item.propertyTypeId?._id || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async () => {
    try {
      setMessage(null);
      setError(null);

      if (!form.title.trim()) {
        setError('Title is required.');
        return;
      }

      if (!form.propertyTypeId) {
        setError('Property type is required.');
        return;
      }

      const payload = {
        ...form,
        slug: form.slug?.trim() ? createSlug(form.slug) : createSlug(form.title),
      };

      if (editingId) {
        await api.patch(`/content/property-sub-types/${editingId}`, payload);
      } else {
        await api.post('/content/property-sub-types', payload);
      }

      setMessage(editingId ? 'Updated successfully.' : 'Created successfully.');
      reset();
      await load(search);
    } catch (err: any) {
      setError(err?.message || 'Unable to save record.');
    }
  };

  const remove = async (id?: string) => {
    if (!id) return;

    try {
      await api.delete(`/content/property-sub-types/${id}`);
      setMessage('Deleted successfully.');
      if (editingId === id) reset();
      await load(search);
    } catch {
      setError('Unable to delete record.');
    }
  };

  return (
    <DashboardShell>
      <Header
        title="Property Sub-Types"
        subtitle="Manage property sub-types and connect them with property types"
      />

      <div className="space-y-6">
        <SectionNotice message={message} error={error} />

        <SectionCard
          title={editingId ? 'Edit Property Sub-Type' : 'Add Property Sub-Type'}
          subtitle="Create and manage property sub-types with linked property type."
          action={
            <div className="flex gap-3">
              <ActionButton secondary onClick={reset}>
                Reset
              </ActionButton>
              <ActionButton onClick={submit}>
                {editingId ? 'Update' : 'Save'}
              </ActionButton>
            </div>
          }
        >
          <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
            <div className="space-y-5">
              <TextInput
                label="Title"
                value={form.title}
                onChange={(value) =>
                  setForm((prev) => {
                    const nextSlug =
                      !prev.slug || prev.slug === createSlug(prev.title)
                        ? createSlug(value)
                        : prev.slug;

                    return { ...prev, title: value, slug: nextSlug };
                  })
                }
              />

              <TextInput
                label="Slug"
                value={form.slug}
                onChange={(value) => setForm((prev) => ({ ...prev, slug: value }))}
              />

              <SelectInput
                label="Property Type"
                value={String(form.propertyTypeId || '')}
                onChange={(value) => setForm((prev) => ({ ...prev, propertyTypeId: value }))}
                options={propertyTypeOptions}
              />

              <TextArea
                label="Description"
                value={form.description || ''}
                onChange={(value) => setForm((prev) => ({ ...prev, description: value }))}
                rows={5}
              />

              <TextInput
                label="Icon"
                value={form.icon || ''}
                onChange={(value) => setForm((prev) => ({ ...prev, icon: value }))}
              />

              <div className="space-y-3">
                <TextInput
                  label="Image"
                  value={form.image || ''}
                  onChange={(value) => setForm((prev) => ({ ...prev, image: value }))}
                  placeholder="Paste image URL or upload below"
                />
                <div>
                  <FieldLabel label="Image Upload" />
                  <input
                    className="input"
                    type="file"
                    accept="image/*"
                    onChange={async (e: ChangeEvent<HTMLInputElement>) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const dataUrl = await fileToDataUrl(file);
                      setForm((prev) => ({ ...prev, image: dataUrl }));
                    }}
                  />
                </div>
                {form.image ? (
                  <img
                    src={form.image}
                    alt="Preview"
                    className="h-36 w-full rounded-2xl border border-line object-cover"
                  />
                ) : null}
              </div>
            </div>

            <div className="space-y-4 rounded-[28px] border border-line bg-panel/50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-gold">
                Meta & Settings
              </p>

              <SelectInput
                label="Status"
                value={form.status}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    status: value as 'active' | 'inactive',
                  }))
                }
                options={[
                  { label: 'Active', value: 'active' },
                  { label: 'Inactive', value: 'inactive' },
                ]}
              />

              <TextInput
                label="Sort Order"
                type="number"
                value={form.sortOrder ?? 0}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, sortOrder: Number(value) }))
                }
              />

              <div>
                <FieldLabel label="Featured" />
                <label className="flex items-center gap-3 rounded-2xl border border-line bg-panel px-4 py-3 text-sm text-text">
                  <input
                    type="checkbox"
                    checked={Boolean(form.isFeatured)}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, isFeatured: e.target.checked }))
                    }
                  />
                  <span>Enabled</span>
                </label>
              </div>

              <FormActions
                onSubmit={submit}
                onCancel={reset}
                submitLabel={editingId ? 'Update Record' : 'Create Record'}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Property Sub-Types Listing"
          subtitle="Search, review, edit, and remove saved records."
        >
          <div className="mb-5 flex flex-wrap gap-3">
            <input
              className="input w-72"
              placeholder="Search property sub-types..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') load(search);
              }}
            />
            <ActionButton secondary onClick={() => load(search)}>
              Search
            </ActionButton>
          </div>

          <div className="space-y-3">
            {items.map((item) => {
              const propertyTypeLabel =
                typeof item.propertyTypeId === 'string'
                  ? propertyTypes.find((type) => type._id === item.propertyTypeId)?.title
                  : item.propertyTypeId?.title;

              return (
                <div
                  key={item._id || item.title}
                  className="grid gap-4 rounded-[28px] border border-line bg-panel/60 p-4 xl:grid-cols-[140px_1fr_auto] xl:items-center"
                >
                  <div className="h-28 overflow-hidden rounded-[22px] border border-line bg-card">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-violet-500/15 to-gold/10" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-text">{item.title}</h3>
                      <StatusBadge
                        value={item.status || 'inactive'}
                        tone={item.status === 'active' ? 'green' : 'slate'}
                      />
                    </div>

                    {propertyTypeLabel ? (
                      <p className="mt-2 text-sm text-muted">
                        Type: {propertyTypeLabel}
                      </p>
                    ) : null}

                    {item.slug ? (
                      <p className="mt-2 text-xs text-muted">/{item.slug}</p>
                    ) : null}

                    {item.description ? (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">
                        {item.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="justify-self-end">
                    <InlineActions
                      onEdit={() => edit(item)}
                      onDelete={() => remove(item._id)}
                    />
                  </div>
                </div>
              );
            })}

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