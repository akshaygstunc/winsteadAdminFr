'use client';

import Link from 'next/link';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Header } from '@/components/header';
import { api } from '@/lib/api';
import { Property, WorkspaceSnapshot } from '@/lib/types';
import { ActionButton, SectionCard, StatusBadge } from '@/components/ui';
import { Modal } from '@/components/modal';
import {
  FieldLabel,
  FormActions,
  FormGrid,
  InlineActions,
  SectionNotice,
  SelectInput,
  TextArea,
  TextInput,
} from '@/components/crud-kit';

const emptyForm: Property = {
  title: '',
  buildingName: '',
  metaTitle: '',
  slug: '',
  metaDescription: '',
  type: '',
  subType: '',
  metaKeywords: '',
  developer: '',
  developerType: '',
  shortDescription: '',
  category: '',
  city: '',
  fullDescription: '',
  appDescription: '',
  location: '',
  address: '',
  longitude: '',
  latitude: '',
  propertyStatus: 'Ready',
  visibility: 'both',
  price: 0,
  status: 'active',
  bedrooms: 0,
  bathrooms: 0,
  thumbnail: '',
  enquireFormImage: '',
  featured: false,
  active: true,
  hotLaunch: false,
  exclusive: false,
  sortOrder: 0,
  tag: '',
  url: '',
  author: 'wasim',
  gallery: [],
};

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-2xl border border-line bg-panel px-4 py-3 text-sm text-text">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

type FieldOption = {
  label: string;
  value: string;
};

type DynamicField = {
  key: keyof Property;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'toggle' | 'image';
  options?: FieldOption[];
};

type FieldSection = {
  key: string;
  title: string;
  columns?: 1 | 2 | 3;
  fields?: DynamicField[];
  custom?: 'gallery';
};

const propertyFormSections: FieldSection[] = [
  [
    {
      key: 'basic',
      title: 'Basic Information',
      columns: 3,
      fields: [
        { key: 'title', label: 'Property Name', type: 'text' },
        { key: 'buildingName', label: 'Building / Area Name', type: 'text' },
        { key: 'slug', label: 'Slug', type: 'text' },

        {
          key: 'propertyType',
          label: 'Property Type',
          type: 'relation-select',
          relation: {
            entity: 'property-types',
            labelKey: 'name',
            valueKey: '_id',
          },
        },
        {
          key: 'propertySubType',
          label: 'Property Sub-Type',
          type: 'relation-select',
          relation: {
            entity: 'property-sub-types',
            labelKey: 'name',
            valueKey: '_id',
          },
        },
        {
          key: 'categories',
          label: 'Property Categories',
          type: 'relation-multiselect',
          relation: {
            entity: 'property-categories',
            labelKey: 'name',
            valueKey: '_id',
          },
        },
        {
          key: 'developer',
          label: 'Developer',
          type: 'relation-select',
          relation: {
            entity: 'developers',
            labelKey: 'name',
            valueKey: '_id',
          },
        },
        {
          key: 'developerType',
          label: 'Developer Type',
          type: 'relation-select',
          relation: {
            entity: 'developer-types',
            labelKey: 'name',
            valueKey: '_id',
          },
        },

        {
          key: 'propertyStatus',
          label: 'Property Status',
          type: 'select',
          options: [
            { label: 'Off Plan', value: 'off-plan' },
            { label: 'Ready', value: 'ready' },
            { label: 'Sold Out', value: 'sold-out' },
          ],
        },

        { key: 'city', label: 'City', type: 'text' },
        { key: 'location', label: 'Location', type: 'text' },
        { key: 'address', label: 'Address', type: 'text' },
      ],
    },

    {
      key: 'seo',
      title: 'SEO',
      columns: 3,
      fields: [
        { key: 'metaTitle', label: 'Meta Title', type: 'text' },
        { key: 'metaDescription', label: 'Meta Description', type: 'textarea' },
        { key: 'metaKeywords', label: 'Meta Keywords', type: 'text' },
      ],
    },

    {
      key: 'details',
      title: 'Property Details',
      columns: 3,
      fields: [
        { key: 'longitude', label: 'Longitude', type: 'text' },
        { key: 'latitude', label: 'Latitude', type: 'text' },
        { key: 'price', label: 'Price', type: 'number' },
        { key: 'bedrooms', label: 'Bedrooms', type: 'number' },
        { key: 'bathrooms', label: 'Bathrooms', type: 'number' },
        { key: 'sortOrder', label: 'Sort Order', type: 'number' },

        { key: 'thumbnail', label: 'Thumbnail', type: 'image' },
        { key: 'propertyBanner', label: 'Property Banner', type: 'image' },
        { key: 'enquireFormImage', label: 'Enquire Form Image', type: 'image' },

        { key: 'author', label: 'Author', type: 'text' },
      ],
    },

    {
      key: 'visibility',
      title: 'Visibility & Status',
      columns: 3,
      fields: [
        {
          key: 'visibility',
          label: 'Visibility',
          type: 'select',
          options: [
            { label: 'Mobile', value: 'mobile' },
            { label: 'Web', value: 'web' },
            { label: 'Both', value: 'both' },
          ],
        },
        {
          key: 'status',
          label: 'Status',
          type: 'select',
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
            { label: 'Draft', value: 'draft' },
            { label: 'Ready', value: 'ready' },
            { label: 'Sold', value: 'sold' },
          ],
        },
      ],
    },

    {
      key: 'descriptions',
      title: 'Descriptions',
      columns: 2,
      fields: [
        { key: 'shortDescription', label: 'Short Description', type: 'textarea' },
        { key: 'appDescription', label: 'App Description', type: 'textarea' },
        { key: 'fullDescription', label: 'Full Description', type: 'textarea' },
      ],
    },

    /**
     * Custom Sections
     */
    {
      key: 'amenities',
      title: 'Amenities',
      custom: 'amenities',
    },

    {
      key: 'floorPlans',
      title: 'Floor Plans',
      custom: 'floorPlans',
    },

    {
      key: 'gallery',
      title: 'Gallery Images',
      custom: 'gallery',
    },

    {
      key: 'flags',
      title: 'Flags',
      columns: 2,
      fields: [
        { key: 'active', label: 'Active', type: 'toggle' },
        { key: 'hotLaunch', label: 'Hot Launch', type: 'toggle' },
        { key: 'exclusive', label: 'Exclusive', type: 'toggle' },
        { key: 'featured', label: 'Featured', type: 'toggle' },
      ],
    },
  ]
];

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function GalleryUploader({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const images = Array.isArray(value) ? value : [];

  const handleFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const uploaded = await Promise.all(files.map((file) => fileToDataUrl(file)));
    onChange([...(images || []), ...uploaded]);
    e.target.value = '';
  };

  const updateImage = (index: number, nextValue: string) => {
    const next = [...images];
    next[index] = nextValue;
    onChange(next);
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel label="Gallery Images" />
        <p className="mt-1 text-xs text-muted">
          Upload multiple property gallery images or paste image URLs.
        </p>
      </div>

      <div className="space-y-3 rounded-[24px] border border-line bg-panel/40 p-4">
        <TextInput
          label="Add Image URL"
          value=""
          onChange={() => { }}
          placeholder="Paste URL directly in each card below or upload multiple files"
        />

        <input
          className="input"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFiles}
        />
      </div>

      {!!images.length && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {images.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="space-y-3 rounded-[24px] border border-line bg-panel/40 p-4"
            >
              <TextInput
                label={`Image ${index + 1}`}
                value={image}
                onChange={(next) => updateImage(index, next)}
              />

              {image ? (
                <img
                  src={image}
                  alt={`Gallery ${index + 1}`}
                  className="h-40 w-full rounded-2xl border border-line object-cover"
                />
              ) : null}

              <div className="flex justify-end">
                <ActionButton secondary onClick={() => removeImage(index)}>
                  Remove
                </ActionButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {!images.length ? (
        <div className="rounded-2xl border border-dashed border-line p-6 text-sm text-muted">
          No gallery images added yet.
        </div>
      ) : null}
    </div>
  );
}

function renderDynamicField(
  field: DynamicField,
  form: Property,
  setForm: React.Dispatch<React.SetStateAction<Property>>,
) {
  const value = form[field.key];

  switch (field.type) {
    case 'text':
      return (
        <TextInput
          label={field.label}
          value={String(value ?? '')}
          onChange={(next) =>
            setForm((prev) => {
              const updated = { ...prev, [field.key]: next };

              if (field.key === 'title') {
                const oldSlug = prev.slug || '';
                const generatedOldSlug = createSlug(prev.title || '');
                if (!oldSlug || oldSlug === generatedOldSlug) {
                  updated.slug = createSlug(next);
                }
              }

              return updated;
            })
          }
        />
      );

    case 'number':
      return (
        <TextInput
          label={field.label}
          type="number"
          value={Number(value ?? 0)}
          onChange={(next) =>
            setForm((prev) => ({
              ...prev,
              [field.key]: Number(next),
            }))
          }
        />
      );

    case 'textarea':
      return (
        <TextArea
          label={field.label}
          value={String(value ?? '')}
          onChange={(next) =>
            setForm((prev) => ({
              ...prev,
              [field.key]: next,
            }))
          }
        />
      );

    case 'select':
      return (
        <SelectInput
          label={field.label}
          value={String(value ?? '')}
          onChange={(next) =>
            setForm((prev) => ({
              ...prev,
              [field.key]: next as never,
            }))
          }
          options={field.options || []}
        />
      );

    case 'toggle':
      return (
        <Toggle
          label={field.label}
          checked={Boolean(value)}
          onChange={(next) =>
            setForm((prev) => ({
              ...prev,
              [field.key]: next as never,
            }))
          }
        />
      );

    case 'image':
      return (
        <div className="space-y-3">
          <TextInput
            label={field.label}
            value={String(value ?? '')}
            onChange={(next) =>
              setForm((prev) => ({
                ...prev,
                [field.key]: next,
              }))
            }
            placeholder="Paste image URL or upload below"
          />

          <input
            className="input"
            type="file"
            accept="image/*"
            onChange={async (e: ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const dataUrl = await fileToDataUrl(file);
              setForm((prev) => ({
                ...prev,
                [field.key]: dataUrl,
              }));
            }}
          />

          {value ? (
            <img
              src={String(value)}
              alt={field.label}
              className="h-36 w-full rounded-2xl border border-line object-cover"
            />
          ) : null}
        </div>
      );

    default:
      return null;
  }
}

export default function PropertiesPage() {
  const [items, setItems] = useState<Property[]>([]);
  const [form, setForm] = useState<Property>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const load = async () => {
    try {
      api
        .get<WorkspaceSnapshot>('/workspace/snapshot')
        .then((snapshot) => setItems(snapshot.properties || []))
        .catch(() => undefined);
    } catch {
      setError('Failed to load properties.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const text =
        `${item.title} ${item.location} ${item.category} ${item.city || ''} ${item.developer || ''}`.toLowerCase();
      const matchesSearch = !search || text.includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesType =
        typeFilter === 'all' || item.type === typeFilter || item.category === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [items, search, statusFilter, typeFilter]);

  const close = () => {
    setOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const submit = async () => {
    try {
      setError(null);

      const slug = form.slug || createSlug(form.title || '');

      const payload = {
        ...form,
        slug,
        url: form.url || `/property/${slug}`,
        tag: form.hotLaunch ? 'HOT' : form.exclusive ? 'Exclusive' : form.tag,
        gallery: Array.isArray(form.gallery) ? form.gallery : [],
      };

      if (editingId) {
        await api.patch(`/properties/${editingId}`, payload);
      } else {
        await api.post(`/properties`, payload);
      }

      setMessage(editingId ? 'Property updated.' : 'Property created.');
      close();
      load();
    } catch {
      setError('Unable to save property.');
    }
  };

  const edit = (item: Property) => {
    setForm({
      ...emptyForm,
      ...item,
      gallery: Array.isArray(item.gallery) ? item.gallery : [],
    });
    setEditingId(item._id || null);
    setOpen(true);
  };

  const remove = async (id?: string) => {
    if (!id) return;

    try {
      await api.delete(`/properties/${id}`);
      setMessage('Property deleted.');
      load();
    } catch {
      setError('Unable to delete property.');
    }
  };

  return (
    <DashboardShell>
      <Header
        title="Properties"
        subtitle="Rebuilt toward the screenshot flow: denser cards, status chips, property URL, expanded property form fields, and gallery uploads."
      />

      <SectionNotice message={message} error={error} />

      <SectionCard
        title="Property Listing"
        subtitle="Filters, actions, and richer property cards closer to the recorded admin product."
        action={
          <div className="flex flex-wrap gap-3">
            <input
              className="input w-64"
              placeholder="Search property, city, developer"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="input w-40"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="Apartment">Apartment</option>
              <option value="Villa">Villa</option>
              <option value="Residential">Residential</option>
            </select>

            <select
              className="input w-40"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
              <option value="ready">Ready</option>
              <option value="sold">Sold</option>
            </select>

            <ActionButton secondary>Manage FAQ</ActionButton>
            <ActionButton onClick={() => setOpen(true)}>Add Property</ActionButton>
          </div>
        }
      >
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((property) => (
            <div
              key={property._id || property.title}
              className="rounded-[28px] border border-line bg-panel/80 p-4"
            >
              <div className="flex gap-4">
                <div className="h-28 w-28 shrink-0 overflow-hidden rounded-[22px] border border-line bg-gradient-to-br from-violet-500/20 to-gold/10">
                  {property.thumbnail ? (
                    <img
                      src={property.thumbnail}
                      alt={property.title}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-text">
                          {property.title}
                        </h3>
                        {property.exclusive ? (
                          <StatusBadge value="Exclusive" tone="gold" />
                        ) : null}
                        {property.hotLaunch ? (
                          <StatusBadge value="HOT" tone="red" />
                        ) : null}
                      </div>

                      <p className="mt-1 text-xs text-muted">
                        {property.url || `/property/${property.slug || ''}`}
                      </p>

                      <p className="mt-2 text-sm text-muted">
                        {property.location}
                        {property.city ? `, ${property.city}` : ''}
                      </p>

                      {Array.isArray(property.gallery) && property.gallery.length ? (
                        <p className="mt-2 text-xs text-muted">
                          Gallery: {property.gallery.length} image(s)
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge value={`#${property.sortOrder || 0}`} tone="gold" />
                      <StatusBadge
                        value={property.status || 'draft'}
                        tone={
                          property.status === 'active'
                            ? 'green'
                            : property.status === 'inactive'
                              ? 'red'
                              : 'slate'
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full border border-line px-3 py-1 text-xs text-muted">
                      Floor Plans
                    </span>
                    <span className="rounded-full border border-line px-3 py-1 text-xs text-muted">
                      Features
                    </span>
                    <span className="rounded-full border border-line px-3 py-1 text-xs text-muted">
                      Landmarks
                    </span>
                    <span className="rounded-full border border-line px-3 py-1 text-xs text-muted">
                      FAQs
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-2xl border border-line bg-card/80 p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gold">Beds</p>
                  <p className="mt-2 text-sm text-text">{property.bedrooms}</p>
                </div>
                <div className="rounded-2xl border border-line bg-card/80 p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gold">Baths</p>
                  <p className="mt-2 text-sm text-text">{property.bathrooms}</p>
                </div>
                <div className="rounded-2xl border border-line bg-card/80 p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gold">Author</p>
                  <p className="mt-2 text-sm text-text">{property.author || 'wasim'}</p>
                </div>
                <div className="rounded-2xl border border-line bg-card/80 p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gold">Price</p>
                  <p className="mt-2 text-sm text-text">
                    ${Number(property.price || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <InlineActions
                  onEdit={() => edit(property)}
                  onDelete={() => remove(property._id)}
                />
              </div>
            </div>
          ))}

          {!filtered.length ? (
            <div className="col-span-full rounded-3xl border border-dashed border-line p-8 text-sm text-muted">
              No properties found.
            </div>
          ) : null}
        </div>
      </SectionCard>

      <Modal
        open={open}
        onClose={close}
        title={editingId ? 'Edit Property' : 'Add Property'}
        subtitle="Expanded property form with SEO, geo, visibility, media, and multiple gallery uploads."
        size="xl"
      >
        <div className="space-y-5">
          {propertyFormSections.map((section) => (
            <div
              key={section.key}
              className="space-y-4 rounded-[24px] border border-line bg-panel/40 p-4"
            >
              <h3 className="text-sm font-semibold text-text">{section.title}</h3>

              {section.custom === 'gallery' ? (
                <GalleryUploader
                  value={Array.isArray(form.gallery) ? form.gallery : []}
                  onChange={(next) =>
                    setForm((prev) => ({
                      ...prev,
                      gallery: next,
                    }))
                  }
                />
              ) : (
                <FormGrid columns={section.columns || 3}>
                  {(section.fields || []).map((field) => (
                    <div key={String(field.key)}>
                      {renderDynamicField(field, form, setForm)}
                    </div>
                  ))}
                </FormGrid>
              )}
            </div>
          ))}

          <FormActions
            onSubmit={submit}
            onCancel={close}
            submitLabel={editingId ? 'Update Property' : 'Create Property'}
          />
        </div>
      </Modal>
    </DashboardShell>
  );
}