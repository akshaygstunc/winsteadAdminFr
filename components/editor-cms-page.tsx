'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Header } from '@/components/header';
import { api } from '@/lib/api';
import { CmsConfig, CmsField, CmsItem, CmsRepeaterField } from '@/lib/cms';
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

const ROOT_KEYS = [
  'title',
  'subtitle',
  'slug',
  'status',
  'pageType',
  'image',
  'heroVideo',
  'heroTitle',
  'heroSubtitle',
  'description',
  'metaTitle',
  'metaDescription',
  'sortOrder',
];

function getDefaultValue(field: CmsField | CmsRepeaterField) {
  if (field.defaultValue !== undefined) return field.defaultValue;
  if (field.type === 'boolean') return false;
  if (field.type === 'number') return 0;
  if (field.type === 'multiselect' || field.type === 'relation-multiselect') return [];
  if (field.type === 'repeater') return [];
  return '';
}

function blankFromConfig(config: CmsConfig): CmsItem {
  const data: Record<string, any> = {};

  const item: CmsItem = {
    title: '',
    subtitle: '',
    slug: '',
    status: 'draft',
    pageType: 'standard',
    image: '',
    heroVideo: '',
    heroTitle: '',
    heroSubtitle: '',
    description: '',
    metaTitle: '',
    metaDescription: '',
    sortOrder: 0,
    data: {},
  };

  for (const field of config.fields) {
    const value = getDefaultValue(field);

    if (ROOT_KEYS.includes(field.key)) {
      (item as any)[field.key] = value;
    } else {
      data[field.key] = value;
    }
  }

  item.data = data;
  return item;
}

function getValue(item: CmsItem, field: CmsField) {
  if (ROOT_KEYS.includes(field.key)) return (item as any)[field.key];
  return item.data?.[field.key];
}

function setValue(item: CmsItem, field: CmsField, value: any): CmsItem {
  if (ROOT_KEYS.includes(field.key)) {
    return { ...item, [field.key]: value };
  }

  return {
    ...item,
    data: {
      ...(item.data || {}),
      [field.key]: value,
    },
  };
}

function getFieldRawValue(item: CmsItem, key: string) {
  if (ROOT_KEYS.includes(key)) return (item as any)[key];
  return item.data?.[key];
}

function isFieldVisible(item: CmsItem, field: CmsField) {
  if (!field.showWhen) return true;

  const currentValue = getFieldRawValue(item, field.showWhen.key);
  const operator = field.showWhen.operator || 'equals';

  switch (operator) {
    case 'equals':
      return currentValue === field.showWhen.value;
    case 'notEquals':
      return currentValue !== field.showWhen.value;
    case 'includes':
      return Array.isArray(currentValue) && currentValue.includes(field.showWhen.value);
    default:
      return true;
  }
}

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

function renderSimpleField(
  field: CmsRepeaterField,
  value: any,
  onChange: (value: any) => void,
) {
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
  switch (field.type) {
    case 'textarea':
      return (
        <div>
          <TextArea
            label={field.label}
            value={value || ''}
            onChange={onChange}
            rows={4}
          />
          {field.note ? <p className="mt-2 text-xs text-muted">{field.note}</p> : null}
        </div>
      );

    case 'select':
      return (
        <div>
          <SelectInput
            label={field.label}
            value={value || ''}
            onChange={onChange}
            options={field.options || []}
          />
          {field.note ? <p className="mt-2 text-xs text-muted">{field.note}</p> : null}
        </div>
      );

    case 'number':
      return (
        <div>
          <TextInput
            label={field.label}
            type="number"
            value={value ?? 0}
            onChange={(v) => onChange(Number(v))}
          />
          {field.note ? <p className="mt-2 text-xs text-muted">{field.note}</p> : null}
        </div>
      );

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
          {field.note ? <p className="mt-2 text-xs text-muted">{field.note}</p> : null}
        </div>
      );

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
            placeholder={field.placeholder || 'Paste media URL'}
          />
          <input
            className="input"
            type="file"
            accept={field.type === 'video' ? 'video/*' : 'image/*'}
            onChange={async (e: ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const dataUrl = await uploadAsset(file);
              onChange(dataUrl);
            }}
          />
          {value ? (
            field.type === 'video' ? (
              <video
                src={value}
                controls
                className="h-32 w-full rounded-2xl border border-line object-cover"
              />
            ) : (
              <img
                src={value}
                alt={field.label}
                className="h-32 w-full rounded-2xl border border-line object-cover"
              />
            )
          ) : null}
        </div>
      );

    default:
      return (
        <div>
          <TextInput
            label={field.label}
            value={value || ''}
            onChange={onChange}
            placeholder={field.placeholder}
          />
          {field.note ? <p className="mt-2 text-xs text-muted">{field.note}</p> : null}
        </div>
      );
  }
}

function RepeaterField({
  field,
  value,
  onChange,
}: {
  field: CmsField;
  value: any;
  onChange: (value: any[]) => void;
}) {
  const items = Array.isArray(value) ? value : [];
  const repeaterFields = field.fields || [];

  const createBlankRow = () => {
    const row: Record<string, any> = {};
    for (const subField of repeaterFields) {
      row[subField.key] = getDefaultValue(subField);
    }
    return row;
  };

  const addRow = () => {
    onChange([...items, createBlankRow()]);
  };

  const updateRow = (index: number, key: string, nextValue: any) => {
    const next = [...items];
    next[index] = { ...next[index], [key]: nextValue };
    onChange(next);
  };

  const removeRow = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const moveRow = (index: number, direction: 'up' | 'down') => {
    const next = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= next.length) return;
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel label={field.label} />
        {field.note ? <p className="mt-1 text-xs text-muted">{field.note}</p> : null}
      </div>

      <div className="space-y-4">
        {items.map((row, index) => (
          <div key={index} className="space-y-4 rounded-[24px] border border-line bg-panel/40 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-text">
                {field.label} #{index + 1}
              </p>

              <div className="flex gap-2">
                <ActionButton secondary onClick={() => moveRow(index, 'up')}>
                  ↑
                </ActionButton>
                <ActionButton secondary onClick={() => moveRow(index, 'down')}>
                  ↓
                </ActionButton>
                <ActionButton secondary onClick={() => removeRow(index)}>
                  Remove
                </ActionButton>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {repeaterFields.map((subField) => (
                <div key={subField.key}>
                  {renderSimpleField(
                    subField,
                    row?.[subField.key],
                    (nextValue) => updateRow(index, subField.key, nextValue),
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <ActionButton secondary onClick={addRow}>
        + Add {field.label}
      </ActionButton>
    </div>
  );
}

function RelationMultiSelectField({
  field,
  value,
  onChange,
  options,
}: {
  field: CmsField;
  value: any;
  onChange: (value: string[]) => void;
  options: { label: string; value: string }[];
}) {
  const selected = Array.isArray(value) ? value : [];

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

function renderField(
  field: CmsField,
  value: any,
  onChange: (value: any) => void,
  relationOptions: Record<string, { label: string; value: string }[]>,
) {
  const uploadAsset = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file);
      const data = await await api.post<any[]>(
        `/content/upload/gallery`,
        formData,

      );

      return data?.data?.url;
    } catch {
      alert('Failed to upload asset.');
      return null;
    }
  }
  switch (field.type) {
    case 'repeater':
      return <RepeaterField field={field} value={value} onChange={onChange} />;

    case 'relation-multiselect':
      return (
        <RelationMultiSelectField
          field={field}
          value={value}
          onChange={onChange}
          options={relationOptions[field.key] || []}
        />
      );

    case 'textarea':
      return (
        <div>
          <TextArea
            label={field.label}
            value={value || ''}
            onChange={onChange}
            rows={
              field.key.toLowerCase().includes('body') ||
                field.key.toLowerCase().includes('content')
                ? 6
                : 4
            }
          />
          {field.note ? <p className="mt-2 text-xs text-muted">{field.note}</p> : null}
        </div>
      );

    case 'select':
      return (
        <div>
          <SelectInput
            label={field.label}
            value={value || ''}
            onChange={onChange}
            options={field.options || []}
          />
          {field.note ? <p className="mt-2 text-xs text-muted">{field.note}</p> : null}
        </div>
      );

    case 'number':
      return (
        <div>
          <TextInput
            label={field.label}
            type="number"
            value={value ?? 0}
            onChange={(v) => onChange(Number(v))}
          />
          {field.note ? <p className="mt-2 text-xs text-muted">{field.note}</p> : null}
        </div>
      );

    case 'date':
      return (
        <div>
          <TextInput
            label={field.label}
            type="date"
            value={value || ''}
            onChange={onChange}
          />
          {field.note ? <p className="mt-2 text-xs text-muted">{field.note}</p> : null}
        </div>
      );

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
          {field.note ? <p className="mt-2 text-xs text-muted">{field.note}</p> : null}
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
            placeholder={field.placeholder || 'Paste media URL or upload below'}
          />
          <div>
            <FieldLabel label={`${field.label} Upload`} />
            <input
              className="input"
              type="file"
              accept={field.type === 'video' ? 'video/*' : 'image/*'}
              onChange={async (e: ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const dataUrl = await uploadAsset(file);
                onChange(dataUrl);
              }}
            />
          </div>

          {value ? (
            field.type === 'video' ? (
              <video
                src={value}
                controls
                className="h-36 w-full rounded-2xl border border-line object-cover"
              />
            ) : (
              <img
                src={value}
                alt={field.label}
                className="h-36 w-full rounded-2xl border border-line object-cover"
              />
            )
          ) : null}

          {field.note ? <p className="text-xs text-muted">{field.note}</p> : null}
        </div>
      );

    default:
      return (
        <div>
          <TextInput
            label={field.label}
            value={value || ''}
            onChange={onChange}
            placeholder={field.placeholder}
          />
          {field.note ? <p className="mt-2 text-xs text-muted">{field.note}</p> : null}
        </div>
      );
  }
}

function FieldGroup({
  title,
  fields,
  form,
  setForm,
  relationOptions,
}: {
  title: string;
  fields: CmsField[];
  form: CmsItem;
  setForm: React.Dispatch<React.SetStateAction<CmsItem>>;
  relationOptions: Record<string, { label: string; value: string }[]>;
}) {
  if (!fields.length) return null;

  return (
    <div className="space-y-4 rounded-[24px] border border-line bg-panel/40 p-4">
      <h3 className="text-sm font-semibold text-text">{title}</h3>

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.key}>
            {renderField(
              field,
              getValue(form, field),
              (value) =>
                setForm((prev) => {
                  let next = setValue(prev, field, value);

                  if (field.key === 'title') {
                    const currentSlug = next.slug || '';
                    const oldSlug = prev.slug || '';
                    const generatedOldSlug = createSlug(prev.title || '');

                    if (
                      !currentSlug ||
                      currentSlug === oldSlug ||
                      currentSlug === generatedOldSlug
                    ) {
                      next = { ...next, slug: createSlug(String(value || '')) };
                    }
                  }

                  return next;
                }),
              relationOptions,
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function sanitizePayload(form: CmsItem) {
  return {
    title: String(form.title || '').trim(),
    subtitle: String((form as any).subtitle || '').trim(),
    slug: String(form.slug || '').trim() || createSlug(String(form.title || '')),
    status: String((form as any).status || 'draft').trim(),
    pageType: String((form as any).pageType || 'standard').trim(),
    image: String((form as any).image || '').trim(),
    heroVideo: String((form as any).heroVideo || '').trim(),
    heroTitle: String((form as any).heroTitle || '').trim(),
    heroSubtitle: String((form as any).heroSubtitle || '').trim(),
    description: String((form as any).description || '').trim(),
    metaTitle: String((form as any).metaTitle || '').trim(),
    metaDescription: String((form as any).metaDescription || '').trim(),
    sortOrder: Number((form as any).sortOrder || 0),
    data:
      form.data && typeof form.data === 'object' && !Array.isArray(form.data)
        ? form.data
        : {},
  };
}

export function PageEditorCmsPage({ config }: { config: CmsConfig }) {
  const [items, setItems] = useState<CmsItem[]>([]);
  const [form, setForm] = useState<CmsItem>(blankFromConfig(config));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [relationOptions, setRelationOptions] = useState<
    Record<string, { label: string; value: string }[]>
  >({});

  const visibleFields = useMemo(
    () => config.fields.filter((field) => isFieldVisible(form, field)),
    [config.fields, form],
  );

  const leftGroups = useMemo(
    () => config.groups.filter((group) => group.column === 'left'),
    [config.groups],
  );

  const rightGroups = useMemo(
    () => config.groups.filter((group) => group.column === 'right'),
    [config.groups],
  );

  const fieldsByGroup = (groupKey: string) =>
    visibleFields.filter((field) => field.group === groupKey);

  const load = async (term = '') => {
    try {
      const rows = await api.get<CmsItem[]>(
        `/content/${config.entity}${term ? `?search=${encodeURIComponent(term)}` : ''}`,
      );
      setItems(rows || []);
    } catch {
      setError('Failed to load records.');
    }
  };

  const loadRelations = async () => {
    try {
      const relationFields = config.fields.filter(
        (field) => field.type === 'relation-multiselect' && field.relation?.endpoint,
      );

      const results: Record<string, { label: string; value: string }[]> = {};

      await Promise.all(
        relationFields.map(async (field) => {
          try {
            const rows = await api.get<any[]>(field.relation!.endpoint);
            results[field.key] = (rows || []).map((row) => ({
              label:
                row[field.relation?.labelKey || 'title'] ||
                row.title ||
                row.name ||
                'Untitled',
              value: row[field.relation?.valueKey || '_id'] || row._id,
            }));
          } catch {
            results[field.key] = [];
          }
        }),
      );

      setRelationOptions(results);
    } catch {
      // ignore relation loading failure
    }
  };

  useEffect(() => {
    load();
    loadRelations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.entity]);

  const reset = () => {
    setEditingId(null);
    setForm(blankFromConfig(config));
    setMessage(null);
    setError(null);
  };

  const edit = (item: CmsItem) => {
    setaddForm(!adform)
    setEditingId(item._id || null);

    const blank = blankFromConfig(config);
    setForm({
      ...blank,
      ...item,
      data: {
        ...(blank.data || {}),
        ...(item.data || {}),
      },
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validate = () => {
    for (const field of visibleFields) {
      if (!field.required) continue;
      const value = getValue(form, field);

      if (
        value === '' ||
        value === null ||
        value === undefined ||
        (Array.isArray(value) && !value.length)
      ) {
        return `${field.label} is required.`;
      }
    }
    return null;
  };

  const submit = async () => {
    try {
      setMessage(null);
      setError(null);

      const validationError = validate();
      if (validationError) {
        setError(validationError);
        return;
      }

      const payload = sanitizePayload(form);

      if (editingId) {
        await api.patch(`/content/${config.entity}/${editingId}`, payload);
      } else {
        await api.post(`/content/${config.entity}`, payload);
      }

      await load(search);
      setMessage(editingId ? 'Updated successfully.' : 'Created successfully.');
      reset();
    } catch {
      setError('Unable to save record.');
    }
  };
  const [adform, setaddForm] = useState(false)
  const remove = async (id?: string) => {
    if (!id) return;

    try {
      await api.delete(`/content/${config.entity}/${id}`);

      if (editingId === id) {
        reset();
      }

      await load(search);
      setMessage('Deleted successfully.');
    } catch {
      setError('Unable to delete record.');
    }
  };

  return (
    <DashboardShell>
      <Header title={config.title} subtitle={config.subtitle} />

      <div className="space-y-6">
        <SectionNotice message={message} error={error} />

        {adform && <SectionCard
          title={
            editingId
              ? `Edit ${config.title.slice(0, -1) || config.title}`
              : config.addLabel || `Add ${config.title}`
          }
          subtitle="Frontend-controlled CMS with manual, linked, auto, and repeatable section content."
          action={
            <div className="flex gap-3">
              <ActionButton secondary onClick={() => setaddForm(!adform)}>
                Cancel
              </ActionButton>
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
              {leftGroups.map((group) => (
                <FieldGroup
                  key={group.key}
                  title={group.label}
                  fields={fieldsByGroup(group.key)}
                  form={form}
                  setForm={setForm}
                  relationOptions={relationOptions}
                />
              ))}
            </div>

            <div className="space-y-4 rounded-[28px] border border-line bg-panel/50 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-gold">
                Meta & Settings
              </p>

              {rightGroups.map((group) => (
                <FieldGroup
                  key={group.key}
                  title={group.label}
                  fields={fieldsByGroup(group.key)}
                  form={form}
                  setForm={setForm}
                  relationOptions={relationOptions}
                />
              ))}

              <FormActions
                onSubmit={submit}
                onCancel={reset}
                submitLabel={editingId ? 'Update Record' : 'Create Record'}
              />
            </div>
          </div>
        </SectionCard>}

        <SectionCard
          title={`${config.title} Listing`}
          subtitle="Search, review, edit, and remove saved records."
          action={<div className="flex gap-3">
            <ActionButton secondary onClick={() => setaddForm(!adform)}>
              Add Page
            </ActionButton>
          </div>}
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
            <ActionButton secondary onClick={() => load(search)}>
              Search
            </ActionButton>
          </div>

          <div className="space-y-3">
            {items.map((item) => (
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
                      value={item.status || 'draft'}
                      tone={item.status === 'published' ? 'green' : 'slate'}
                    />
                  </div>

                  {item.subtitle ? <p className="mt-2 text-sm text-muted">{item.subtitle}</p> : null}
                  {item.slug ? <p className="mt-2 text-xs text-muted">/{item.slug}</p> : null}
                  {(item as any).pageType ? (
                    <p className="mt-2 text-xs text-muted">Type: {(item as any).pageType}</p>
                  ) : null}
                  {item.description ? (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">
                      {item.description}
                    </p>
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