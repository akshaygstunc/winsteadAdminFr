'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Header } from '@/components/header';
import { Modal } from '@/components/modal';
import { ActionButton, SectionCard, StatusBadge } from '@/components/ui';
import { api } from '@/lib/api';
import { CmsConfig, CmsField, CmsItem } from '@/lib/cms';
import { FieldLabel, FormActions, FormGrid, InlineActions, SectionNotice, SelectInput, TextArea, TextInput } from '@/components/crud-kit';

function blankFromConfig(config: CmsConfig): CmsItem {
  const data: Record<string, any> = {};
  config.fields.forEach((field) => {
    if (['title', 'subtitle', 'slug', 'status', 'image', 'description', 'sortOrder'].includes(field.key)) return;
    data[field.key] = field.type === 'boolean' ? false : field.type === 'number' ? 0 : field.type === 'multiselect' ? [] : '';
  });
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
  return item.data?.[field.key] ?? (field.type === 'number' ? 0 : field.type === 'boolean' ? false : '');
}

function setValue(item: CmsItem, field: CmsField, value: any): CmsItem {
  if (field.key in item) return { ...item, [field.key]: value };
  return { ...item, data: { ...(item.data || {}), [field.key]: value } };
}

async function fileToDataUrl(file: File) {
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
  return uploadedUrl
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
    <div className="space-y-6 w-full">
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
function renderField(field: CmsField, value: any, onChange: (value: any) => void) {
  switch (field.type) {
    case 'textarea':
      return <TextArea label={field.label} value={value || ''} onChange={onChange} />;
    case 'select':
      return <SelectInput label={field.label} value={value || ''} onChange={onChange} options={field.options || []} />;
    case 'number':
      return <TextInput label={field.label} type="number" value={value ?? 0} onChange={(v) => onChange(Number(v))} />;
    case 'date':
      return <TextInput label={field.label} type="date" value={value || ''} onChange={onChange} />;
    case 'boolean':
      return (
        <div>
          <FieldLabel label={field.label} />
          <label className="flex items-center gap-3 rounded-2xl border border-line bg-panel px-4 py-3 text-sm text-text">
            <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
            <span>Enabled</span>
          </label>
        </div>
      );
    case 'multiselect': {
      const selected = Array.isArray(value) ? value : [];
      return (
        <div>
          <FieldLabel label={field.label} />
          <div className="grid gap-2 sm:grid-cols-2">{(field.options || []).map((option) => (
            <label key={option.value} className="flex items-center gap-2 rounded-2xl border border-line bg-panel px-3 py-2 text-sm text-text">
              <input type="checkbox" checked={selected.includes(option.value)} onChange={(e) => onChange(e.target.checked ? [...selected, option.value] : selected.filter((v: string) => v !== option.value))} />
              <span>{option.label}</span>
            </label>
          ))}</div>
          {field.note ? <p className="mt-2 text-xs text-muted">{field.note}</p> : null}
        </div>
      );
    }
    case 'gallery':
      return <GalleryUploader value={value || []} onChange={onChange} />;

    case 'icon': {
      return (
        <div>
          <FieldLabel label={field.label} />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{['building-2','map-pin','star','home','users','images','briefcase-business','badge-dollar-sign'].map((icon) => (
            <button key={icon} type="button" onClick={() => onChange(icon)} className={`rounded-2xl border px-3 py-3 text-sm ${value === icon ? 'border-gold bg-gold/10 text-gold' : 'border-line bg-panel text-text'}`}>{icon}</button>
          ))}</div>
          {field.note ? <p className="mt-2 text-xs text-muted">{field.note}</p> : null}
        </div>
      );
    }
    case 'video':
    case 'image':
      return (
        <div className="space-y-3">
          <TextInput label={field.label} value={value || ''} onChange={onChange} placeholder="Paste image URL or upload below" />
          <div>
            <FieldLabel label={`${field.label} Upload`} />
            <input
              className="input"
              type="file"
              accept={field.type === 'video' ? 'video/mp4' : 'image/*'}
              onChange={async (e: ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const dataUrl = await fileToDataUrl(file);
                onChange(dataUrl);
              }}
            />
          </div>
          {field.note ? <p className="text-xs text-muted">{field.note}</p> : null}
          {value ? (field.type === 'video' ? <video src={value} controls className="h-28 w-full rounded-2xl border border-line object-cover" /> : <img src={value} alt={field.label} className="h-28 w-full rounded-2xl border border-line object-cover" />) : null}
        </div>
      );
    default:
      return <div><TextInput label={field.label} value={value || ''} onChange={onChange} placeholder={field.placeholder} />{field.note ? <p className="mt-2 text-xs text-muted">{field.note}</p> : null}</div>;
  }
}

export function GenericCmsPage({ config }: { config: CmsConfig }) {
  const isSingleton = config.mode === 'singleton';
  const [items, setItems] = useState<CmsItem[]>([]);
  const [form, setForm] = useState<CmsItem>(blankFromConfig(config));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(isSingleton);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async (term = '') => {
    setLoading(true);
    setError(null);
    try {
      if (isSingleton) {
        const item = await api.get<CmsItem>(`/content/${config.entity}/singleton`);
        setItems([item]);
        setForm({ ...blankFromConfig(config), ...item, data: { ...blankFromConfig(config).data, ...(item.data || {}) } });
        setOpen(true);
      } else {
        const rows = await api.get<CmsItem[]>(`/content/${config.entity}${term ? `?search=${encodeURIComponent(term)}` : ''}`);
        setItems(rows);
      }
    } catch (err) {
      setError('Failed to load records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [config.entity]);

  const groupedFields = useMemo(() => {
    const chunks: CmsField[][] = [];
    for (let i = 0; i < config.fields.length; i += 3) chunks.push(config.fields.slice(i, i + 3));
    return chunks;
  }, [config.fields]);

  const resetForm = () => {
    setEditingId(null);
    setForm(blankFromConfig(config));
    if (!isSingleton) setOpen(false);
  };

  const onEdit = (item: CmsItem) => {
    setEditingId(item._id || null);
    setForm({ ...blankFromConfig(config), ...item, data: { ...blankFromConfig(config).data, ...(item.data || {}) } });
    setOpen(true);
  };

  const onSubmit = async () => {
    try {
      setError(null);
      if (isSingleton) {
        await api.patch(`/content/${config.entity}/singleton`, form);
        setMessage('Saved successfully.');
        await load();
        return;
      }
      if (editingId) await api.patch(`/content/${config.entity}/${editingId}`, form);
      else await api.post(`/content/${config.entity}`, form);
      setMessage(editingId ? 'Updated successfully.' : 'Created successfully.');
      resetForm();
      await load(search);
    } catch {
      setError('Unable to save record.');
    }
  };

  const onDelete = async (id?: string) => {
    if (!id) return;
    try {
      await api.delete(`/content/${config.entity}/${id}`);
      setMessage('Deleted successfully.');
      await load(search);
    } catch {
      setError('Unable to delete record.');
    }
  };

  return (
    <DashboardShell>
      <Header title={config.title} subtitle={config.subtitle} />
      <div className="space-y-6">
        <SectionNotice message={message} error={error} />

        {!isSingleton ? (
          <SectionCard
            title={`${config.title} Records`}
            subtitle="Fully wired add, edit, delete, search, and image persistence flow."
            action={
              <div className="flex flex-wrap gap-3">
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
                <ActionButton onClick={() => { setEditingId(null); setForm(blankFromConfig(config)); setOpen(true); }}>{config.addLabel || 'Add New'}</ActionButton>
              </div>
            }
          >
            {loading ? <p className="text-sm text-muted">Loading...</p> : null}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <article key={item._id || item.title} className="rounded-[28px] border border-line bg-panel/70 p-4">
                  {item.image ? <img src={item.image} alt={item.title} className="mb-4 h-40 w-full rounded-[22px] border border-line object-cover" /> : <div className="mb-4 h-40 rounded-[22px] border border-dashed border-line bg-gradient-to-br from-violet-500/15 via-transparent to-gold/10" />}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-text">{item.title}</h3>
                      {item.subtitle ? <p className="mt-1 text-sm text-muted">{item.subtitle}</p> : null}
                    </div>
                    <StatusBadge value={item.status || 'draft'} tone={item.status === 'active' || item.status === 'published' ? 'green' : item.status === 'archived' ? 'red' : 'gold'} />
                  </div>
                  {config.cardMeta?.length ? (
                    <div className="mt-4 grid gap-2">
                      {config.cardMeta.map((key) => {
                        const val = getValue(item, { key, label: key, type: 'text' } as CmsField);
                        if (val === undefined || val === null || val === '') return null;
                        return <div key={key} className="rounded-2xl border border-line bg-card/70 px-3 py-2 text-sm text-muted"><span className="text-gold">{key.replace(/([A-Z])/g, ' $1')}:</span> {String(val)}</div>;
                      })}
                    </div>
                  ) : null}
                  {item.description ? <p className="mt-4 line-clamp-4 text-sm leading-6 text-muted">{item.description}</p> : null}
                  <div className="mt-4 flex justify-end">
                    <InlineActions onEdit={() => onEdit(item)} onDelete={() => onDelete(item._id)} />
                  </div>
                </article>
              ))}
              {!items.length && !loading ? <div className="rounded-3xl border border-dashed border-line p-8 text-sm text-muted">No records found.</div> : null}
            </div>
          </SectionCard>
        ) : null}

        {isSingleton ? (
          <SectionCard title={config.title} subtitle="Singleton settings editor with image upload and persistent save.">
            <div className="space-y-5">
              {form.image ? <img src={form.image} alt={form.title} className="h-64 w-full rounded-[28px] border border-line object-cover" /> : null}
              {groupedFields.map((group, index) => (
                <FormGrid key={index} columns={3}>
                  {group.map((field) => (
                    <div key={field.key} className={field.type === 'textarea' || field.type === 'image' ? 'md:col-span-2 xl:col-span-3' : ''}>
                      {renderField(field, getValue(form, field), (value) => setForm((prev) => setValue(prev, field, value)))}
                    </div>
                  ))}
                </FormGrid>
              ))}
              <FormActions onSubmit={onSubmit} submitLabel={config.addLabel || 'Save'} />
            </div>
          </SectionCard>
        ) : null}

        {!isSingleton ? (
          <Modal open={open} onClose={resetForm} title={editingId ? `Edit ${config.title}` : config.addLabel || `Add ${config.title}`} subtitle="Every route now has its own working form, search flow, and persistent Mongo-backed record storage." size="xl">
            <div className="space-y-5">
              {groupedFields.map((group, index) => (
                <FormGrid key={index} columns={3}>
                  {group.map((field) => (
                    <div key={field.key} className={field.type === 'textarea' || field.type === 'image' ? 'md:col-span-2 xl:col-span-3' : ''}>
                      {renderField(field, getValue(form, field), (value) => setForm((prev) => setValue(prev, field, value)))}
                    </div>
                  ))}
                </FormGrid>
              ))}
              <FormActions onSubmit={onSubmit} onCancel={resetForm} submitLabel={editingId ? 'Update' : 'Create'} />
            </div>
          </Modal>
        ) : null}
      </div>
    </DashboardShell>
  );
}
