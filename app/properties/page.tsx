'use client';

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

type FieldOption = {
  label: string;
  value: string;
};

type RelationConfig = {
  entity: string;
  labelKey: string;
  valueKey: string;
};

type AmenityItem = {
  title: string;
  icon: string;
  description: string;
};

type FloorPlanItem = {
  unitType: string;
  title: string;
  bedrooms: number;
  bathrooms: number;
  size: string;
  price: number;
  image: string;
  category: string;
  sortOrder: number;
};

type PropertyForm = Property & {
  propertyType?: string;
  propertySubType?: string;
  categories?: string[];
  propertyBanner?: string;
  amenities?: AmenityItem[];
  floorPlans?: FloorPlanItem[];
};

type DynamicField = {
  key: keyof PropertyForm;
  label: string;
  type:
  | 'text'
  | 'number'
  | 'textarea'
  | 'select'
  | 'toggle'
  | 'image'
  | 'relation-select'
  | 'relation-multiselect';
  options?: FieldOption[];
  relation?: RelationConfig;
};

type FieldSection = {
  key: string;
  title: string;
  columns?: 1 | 2 | 3;
  fields?: DynamicField[];
  custom?: 'gallery' | 'amenities' | 'floorPlans';
};

type RelationData = Record<string, FieldOption[]>;

const emptyForm: PropertyForm = {
  title: '',
  buildingName: '',
  metaTitle: '',
  slug: '',
  metaDescription: '',
  metaKeywords: '',
  developer: '',
  developerType: '',
  shortDescription: '',
  city: '',
  fullDescription: '',
  appDescription: '',
  location: '',
  address: '',
  longitude: '',
  latitude: '',
  propertyStatus: 'ready',
  visibility: 'both',
  price: 0,
  status: 'active',
  bedrooms: 0,
  bathrooms: 0,
  thumbnail: '',
  propertyBanner: '',
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
  propertyType: '',
  propertySubType: '',
  categories: [],
  amenities: [],
  floorPlans: [],
  type: '',
  subType: '',
  category: '',
};

const propertyFormSections: FieldSection[] = [
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
          entity: 'content/property-types',
          labelKey: 'name',
          valueKey: '_id',
        },
      },
      {
        key: 'propertySubType',
        label: 'Property Sub-Type',
        type: 'relation-select',
        relation: {
          entity: 'content/property-sub-types',
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
          entity: 'content/developer-community',
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
      {
        key: 'location', label: 'Location', type: 'relation-select',
        relation: {
          entity: 'content/location',
          labelKey: 'name',
          valueKey: '_id',
        },
      },
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

function normalizeApiArray(response: any): any[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.payload)) return response.payload;
  return [];
}

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

function MultiSelectInput({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string[];
  options: FieldOption[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      <FieldLabel label={label} />
      <select
        className="input min-h-[140px] w-full"
        multiple
        value={value}
        onChange={(e) => {
          const next = Array.from(e.target.selectedOptions).map((option) => option.value);
          onChange(next);
        }}
      >
        {options.map((option) => (
          <option key={`${label}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <p className="text-xs text-muted">Hold Ctrl / Cmd to select multiple items.</p>
    </div>
  );
}

function GalleryUploader({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const images = Array.isArray(value) ? value : [];
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);

  const uploadSingleFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/content/upload/gallery', formData, {
    });
    console.log(response, 'Upload response');
    const uploadedUrl =
      response?.data?.url ||
      response?.data?.data?.url ||
      response?.data?.fileUrl ||
      response?.data?.data?.fileUrl ||
      response?.data?.location ||
      response?.data?.data?.location ||
      '';

    if (!uploadedUrl) {
      throw new Error('Upload API did not return image URL');
    }

    return uploadedUrl;
  };

  const handleFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);

    try {
      const nextImages = [...images];

      for (const file of files) {
        const uploadedUrl = await uploadSingleFile(file);
        nextImages.push(uploadedUrl);
        onChange([...nextImages]);
      }
    } catch (error) {
      console.error('Gallery upload failed:', error);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const addUrl = () => {
    const next = urlInput.trim();
    if (!next) return;
    onChange([...(images || []), next]);
    setUrlInput('');
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
        <div className="flex gap-2">
          <div className="flex-1">
            <TextInput
              label="Add Image URL"
              value={urlInput}
              onChange={setUrlInput}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="flex items-end">
            <ActionButton secondary onClick={addUrl} disabled={uploading}>
              Add URL
            </ActionButton>
          </div>
        </div>

        <input
          className="input"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFiles}
          disabled={uploading}
        />

        {uploading ? (
          <p className="text-xs text-muted">Uploading images...</p>
        ) : null}
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
                <ActionButton
                  secondary
                  onClick={() => removeImage(index)}
                  disabled={uploading}
                >
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
function AmenitiesEditor({
  value,
  onChange,
}: {
  value: AmenityItem[];
  onChange: (next: AmenityItem[]) => void;
}) {
  const items = Array.isArray(value) ? value : [];

  const updateItem = (index: number, key: keyof AmenityItem, nextValue: string) => {
    const next = [...items];
    next[index] = {
      ...next[index],
      [key]: nextValue,
    };
    onChange(next);
  };

  const addItem = () => {
    onChange([
      ...items,
      {
        title: '',
        icon: '',
        description: '',
      },
    ]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <FieldLabel label="Amenities" />
          <p className="mt-1 text-xs text-muted">
            Add amenity title, icon/image and description.
          </p>
        </div>
        <ActionButton onClick={addItem}>Add Amenity</ActionButton>
      </div>

      {!items.length ? (
        <div className="rounded-2xl border border-dashed border-line p-6 text-sm text-muted">
          No amenities added yet.
        </div>
      ) : null}

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={`amenity-${index}`}
            className="rounded-[24px] border border-line bg-panel/40 p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-text">Amenity {index + 1}</h4>
              <ActionButton secondary onClick={() => removeItem(index)}>
                Remove
              </ActionButton>
            </div>

            <FormGrid columns={2}>
              <TextInput
                label="Amenity Title"
                value={item.title}
                onChange={(next) => updateItem(index, 'title', next)}
              />

              <div className="space-y-3">
                <TextInput
                  label="Amenity Icon"
                  value={item.icon}
                  onChange={(next) => updateItem(index, 'icon', next)}
                  placeholder="Paste icon/image URL or upload below"
                />

                <input
                  className="input"
                  type="file"
                  accept="image/*"
                  onChange={async (e: ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const dataUrl = await fileToDataUrl(file);
                    updateItem(index, 'icon', dataUrl);
                  }}
                />

                {item.icon ? (
                  <img
                    src={item.icon}
                    alt={item.title || `Amenity ${index + 1}`}
                    className="h-24 w-24 rounded-2xl border border-line object-cover"
                  />
                ) : null}
              </div>

              <div className="md:col-span-2">
                <TextArea
                  label="Description"
                  value={item.description}
                  onChange={(next) => updateItem(index, 'description', next)}
                />
              </div>
            </FormGrid>
          </div>
        ))}
      </div>
    </div>
  );
}

function FloorPlansEditor({
  value,
  onChange,
}: {
  value: FloorPlanItem[];
  onChange: (next: FloorPlanItem[]) => void;
}) {
  const items = Array.isArray(value) ? value : [];

  const updateItem = (
    index: number,
    key: keyof FloorPlanItem,
    nextValue: string | number,
  ) => {
    const next = [...items];
    next[index] = {
      ...next[index],
      [key]: nextValue,
    };
    onChange(next);
  };

  const addItem = () => {
    onChange([
      ...items,
      {
        unitType: '',
        title: '',
        bedrooms: 0,
        bathrooms: 0,
        size: '',
        price: 0,
        image: '',
        category: '',
        sortOrder: items.length + 1,
      },
    ]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <FieldLabel label="Floor Plans" />
          <p className="mt-1 text-xs text-muted">
            Add unit type, bedrooms, bathrooms, size, pricing and floor plan image.
          </p>
        </div>
        <ActionButton onClick={addItem}>Add Floor Plan</ActionButton>
      </div>

      {!items.length ? (
        <div className="rounded-2xl border border-dashed border-line p-6 text-sm text-muted">
          No floor plans added yet.
        </div>
      ) : null}

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={`floor-plan-${index}`}
            className="rounded-[24px] border border-line bg-panel/40 p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-text">
                Floor Plan {index + 1}
              </h4>
              <ActionButton secondary onClick={() => removeItem(index)}>
                Remove
              </ActionButton>
            </div>

            <FormGrid columns={3}>
              <TextInput
                label="Unit Type"
                value={item.unitType}
                onChange={(next) => updateItem(index, 'unitType', next)}
                placeholder="1 Bedroom / 2 Bedroom"
              />
              <TextInput
                label="Plan Title"
                value={item.title}
                onChange={(next) => updateItem(index, 'title', next)}
              />
              <TextInput
                label="Category"
                value={item.category}
                onChange={(next) => updateItem(index, 'category', next)}
                placeholder="Apartment / Villa"
              />
              <TextInput
                label="Bedrooms"
                type="number"
                value={Number(item.bedrooms || 0)}
                onChange={(next) => updateItem(index, 'bedrooms', Number(next))}
              />
              <TextInput
                label="Bathrooms"
                type="number"
                value={Number(item.bathrooms || 0)}
                onChange={(next) => updateItem(index, 'bathrooms', Number(next))}
              />
              <TextInput
                label="Sort Order"
                type="number"
                value={Number(item.sortOrder || 0)}
                onChange={(next) => updateItem(index, 'sortOrder', Number(next))}
              />
              <TextInput
                label="Size"
                value={item.size}
                onChange={(next) => updateItem(index, 'size', next)}
                placeholder="850 sq.ft."
              />
              <TextInput
                label="Price"
                type="number"
                value={Number(item.price || 0)}
                onChange={(next) => updateItem(index, 'price', Number(next))}
              />
              <div className="space-y-3">
                <TextInput
                  label="Floor Plan Image"
                  value={item.image}
                  onChange={(next) => updateItem(index, 'image', next)}
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
                    updateItem(index, 'image', dataUrl);
                  }}
                />

                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title || `Floor Plan ${index + 1}`}
                    className="h-32 w-full rounded-2xl border border-line object-cover"
                  />
                ) : null}
              </div>
            </FormGrid>
          </div>
        ))}
      </div>
    </div>
  );
}

function getRelationLabel(
  relations: RelationData,
  entity: string,
  value?: string | null,
) {
  if (!value) return '';
  const option = (relations[entity] || []).find((item) => item.value === value);
  return option?.label || value;
}

function renderDynamicField(
  field: DynamicField,
  form: PropertyForm,
  setForm: React.Dispatch<React.SetStateAction<PropertyForm>>,
  relations: RelationData,
) {
  const value = form[field.key];
  const uploadSingleFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/content/upload/gallery', formData);
    console.log(response, 'Upload response');
    const uploadedUrl =
      response?.data?.url ||
      response?.data?.data?.url ||
      response?.data?.fileUrl ||
      response?.data?.data?.fileUrl ||
      response?.data?.location ||
      response?.data?.data?.location ||
      '';

    if (!uploadedUrl) {
      throw new Error('Upload API did not return image URL');
    }

    return uploadedUrl;
  };
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

    case 'relation-select':
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
          options={relations[field.relation?.entity || ''] || []}
        />
      );

    case 'relation-multiselect':
      return (
        <MultiSelectInput
          label={field.label}
          value={Array.isArray(value) ? (value as string[]) : []}
          options={relations[field.relation?.entity || ''] || []}
          onChange={(next) =>
            setForm((prev) => ({
              ...prev,
              [field.key]: next as never,
            }))
          }
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
              const dataUrl = await uploadSingleFile(file);
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
  const [items, setItems] = useState<PropertyForm[]>([]);
  const [form, setForm] = useState<PropertyForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [relations, setRelations] = useState<RelationData>({});

  const load = async () => {
    try {
      const snapshot = await api.get<WorkspaceSnapshot>('/workspace/snapshot');
      setItems(((snapshot as any)?.properties || []) as PropertyForm[]);
    } catch {
      setError('Failed to load properties.');
    }
  };

  useEffect(() => {
    load();

    const fetchRelations = async () => {
      try {
        const endpoints = [
          'content/property-types',
          'content/property-sub-types',
          'content/property-categories',
          'content/developer-community',
          'content/developer-types',
          'content/location',
        ];

        const responses = await Promise.all(
          endpoints.map((endpoint) => api.get(`/${endpoint}`).catch(() => [])),
        );

        const nextRelations: RelationData = {};

        endpoints.forEach((endpoint, index) => {
          const rows = normalizeApiArray(responses[index]);
          nextRelations[endpoint] = rows.map((row: any) => ({
            label: String(row?.name ?? row?.title ?? row?.label ?? ''),
            value: String(row?._id ?? row?.id ?? row?.value ?? ''),
          }));
        });

        setRelations(nextRelations);
      } catch {
        // ignore relation loading errors for now
      }
    };

    fetchRelations();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const categoryText = Array.isArray(item.categories)
        ? item.categories.join(' ')
        : item.category || '';

      const relationText = [
        item.title,
        item.location,
        categoryText,
        item.city || '',
        item.developer || '',
        item.propertyType || '',
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch = !search || relationText.includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

      const typeLabel = getRelationLabel(relations, 'property-types', item.propertyType);
      const matchesType =
        typeFilter === 'all' ||
        item.propertyType === typeFilter ||
        item.type === typeFilter ||
        typeLabel === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [items, search, statusFilter, typeFilter, relations]);

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
        amenities: Array.isArray(form.amenities) ? form.amenities : [],
        floorPlans: Array.isArray(form.floorPlans) ? form.floorPlans : [],
        type: form.propertyType || form.type || '',
        subType: form.propertySubType || form.subType || '',
        category: Array.isArray(form.categories) ? form.categories[0] || '' : form.category || '',
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

  const edit = (item: PropertyForm) => {
    setForm({
      ...emptyForm,
      ...item,
      gallery: Array.isArray(item.gallery) ? item.gallery : [],
      categories: Array.isArray(item.categories)
        ? item.categories
        : item.category
          ? [item.category]
          : [],
      propertyType: item.propertyType || item.type || '',
      propertySubType: item.propertySubType || item.subType || '',
      amenities: Array.isArray(item.amenities) ? item.amenities : [],
      floorPlans: Array.isArray(item.floorPlans) ? item.floorPlans : [],
      propertyBanner: item.propertyBanner || '',
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

  const typeFilterOptions = relations['property-types'] || [];

  return (
    <DashboardShell>
      <Header
        title="Properties"
        subtitle="Expanded property form with API-driven relations, amenities, floor plans, and gallery uploads."
      />

      <SectionNotice message={message} error={error} />

      <SectionCard
        title="Property Listing"
        subtitle="Filters, actions, and richer property cards closer to the admin product flow."
        action={
          <div className="flex flex-wrap gap-3">
            <input
              className="input w-64"
              placeholder="Search property, city, developer"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="input w-48"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              {typeFilterOptions.map((option) => (
                <option key={`type-filter-${option.value}`} value={option.value}>
                  {option.label}
                </option>
              ))}
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
          {filtered.map((property) => {
            const developerLabel = getRelationLabel(
              relations,
              'developers',
              property.developer,
            );
            const typeLabel = getRelationLabel(
              relations,
              'property-types',
              property.propertyType || property.type,
            );

            return (
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

                        <p className="mt-2 text-xs text-muted">
                          {typeLabel ? `Type: ${typeLabel}` : 'Type: —'}
                          {developerLabel ? ` • Developer: ${developerLabel}` : ''}
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
                        Floor Plans: {Array.isArray(property.floorPlans) ? property.floorPlans.length : 0}
                      </span>
                      <span className="rounded-full border border-line px-3 py-1 text-xs text-muted">
                        Amenities: {Array.isArray(property.amenities) ? property.amenities.length : 0}
                      </span>
                      <span className="rounded-full border border-line px-3 py-1 text-xs text-muted">
                        Gallery: {Array.isArray(property.gallery) ? property.gallery.length : 0}
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
            );
          })}

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
        subtitle="Expanded property form with SEO, geo, visibility, API relations, media, amenities, floor plans, and gallery uploads."
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
              ) : section.custom === 'amenities' ? (
                <AmenitiesEditor
                  value={Array.isArray(form.amenities) ? form.amenities : []}
                  onChange={(next) =>
                    setForm((prev) => ({
                      ...prev,
                      amenities: next,
                    }))
                  }
                />
              ) : section.custom === 'floorPlans' ? (
                <FloorPlansEditor
                  value={Array.isArray(form.floorPlans) ? form.floorPlans : []}
                  onChange={(next) =>
                    setForm((prev) => ({
                      ...prev,
                      floorPlans: next,
                    }))
                  }
                />
              ) : (
                <FormGrid columns={section.columns || 3}>
                  {(section.fields || []).map((field) => (
                    <div key={String(field.key)}>
                      {renderDynamicField(field, form, setForm, relations)}
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