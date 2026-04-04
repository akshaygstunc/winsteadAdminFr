'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Header } from '@/components/header';
import { api } from '@/lib/api';
import { Property, WorkspaceSnapshot } from '@/lib/types';
import { ActionButton, SectionCard, StatusBadge } from '@/components/ui';
import { Modal } from '@/components/modal';
import { FormActions, FormGrid, InlineActions, SectionNotice, SelectInput, TextArea, TextInput } from '@/components/crud-kit';

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
};

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded-2xl border border-line bg-panel px-4 py-3 text-sm text-text">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
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
      api.get<WorkspaceSnapshot>('/workspace/snapshot').then((snapshot) => setItems(snapshot.properties || [])).catch(() => undefined);
    } catch {
      setError('Failed to load properties.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const text = `${item.title} ${item.location} ${item.category} ${item.city || ''} ${item.developer || ''}`.toLowerCase();
      const matchesSearch = !search || text.includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesType = typeFilter === 'all' || item.type === typeFilter || item.category === typeFilter;
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
      const payload = {
        ...form,
        slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        url: form.url || `/property/${form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}`,
        tag: form.hotLaunch ? 'HOT' : form.exclusive ? 'Exclusive' : form.tag,
      };
      if (editingId) await api.patch(`/properties/${editingId}`, payload);
      else await api.post('/properties', payload);
      setMessage(editingId ? 'Property updated.' : 'Property created.');
      close();
      load();
    } catch {
      setError('Unable to save property.');
    }
  };

  const edit = (item: Property) => {
    setForm({ ...emptyForm, ...item });
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
      <Header title="Properties" subtitle="Rebuilt toward the screenshot flow: denser cards, status chips, property URL, and expanded property form fields." />
      <SectionNotice message={message} error={error} />
      <SectionCard
        title="Property Listing"
        subtitle="Filters, actions, and richer property cards closer to the recorded admin product."
        action={
          <div className="flex flex-wrap gap-3">
            <input className="input w-64" placeholder="Search property, city, developer" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select className="input w-40" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              <option value="Apartment">Apartment</option>
              <option value="Villa">Villa</option>
              <option value="Residential">Residential</option>
            </select>
            <select className="input w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
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
            <div key={property._id || property.title} className="rounded-[28px] border border-line bg-panel/80 p-4">
              <div className="flex gap-4">
                <div className="h-28 w-28 shrink-0 overflow-hidden rounded-[22px] border border-line bg-gradient-to-br from-violet-500/20 to-gold/10">
                  {property.thumbnail ? <img src={property.thumbnail} alt={property.title} className="h-full w-full object-cover" /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-text">{property.title}</h3>
                        {property.exclusive ? <StatusBadge value="Exclusive" tone="gold" /> : null}
                        {property.hotLaunch ? <StatusBadge value="HOT" tone="red" /> : null}
                      </div>
                      <p className="mt-1 text-xs text-muted">{property.url || `/property/${property.slug || ''}`}</p>
                      <p className="mt-2 text-sm text-muted">{property.location}{property.city ? `, ${property.city}` : ''}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StatusBadge value={`#${property.sortOrder || 0}`} tone="gold" />
                      <StatusBadge value={property.status || 'draft'} tone={property.status === 'active' ? 'green' : property.status === 'inactive' ? 'red' : 'slate'} />
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full border border-line px-3 py-1 text-xs text-muted">Floor Plans</span>
                    <span className="rounded-full border border-line px-3 py-1 text-xs text-muted">Features</span>
                    <span className="rounded-full border border-line px-3 py-1 text-xs text-muted">Landmarks</span>
                    <span className="rounded-full border border-line px-3 py-1 text-xs text-muted">FAQs</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-2xl border border-line bg-card/80 p-3"><p className="text-[10px] uppercase tracking-[0.2em] text-gold">Beds</p><p className="mt-2 text-sm text-text">{property.bedrooms}</p></div>
                <div className="rounded-2xl border border-line bg-card/80 p-3"><p className="text-[10px] uppercase tracking-[0.2em] text-gold">Baths</p><p className="mt-2 text-sm text-text">{property.bathrooms}</p></div>
                <div className="rounded-2xl border border-line bg-card/80 p-3"><p className="text-[10px] uppercase tracking-[0.2em] text-gold">Author</p><p className="mt-2 text-sm text-text">{property.author || 'wasim'}</p></div>
                <div className="rounded-2xl border border-line bg-card/80 p-3"><p className="text-[10px] uppercase tracking-[0.2em] text-gold">Price</p><p className="mt-2 text-sm text-text">${Number(property.price || 0).toLocaleString()}</p></div>
              </div>
              <div className="mt-4 flex justify-end">
                <InlineActions onEdit={() => edit(property)} onDelete={() => remove(property._id)} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <Modal open={open} onClose={close} title={editingId ? 'Edit Property' : 'Add Property'} subtitle="Expanded property form mapped to the screenshots: SEO, geo, visibility, and app fields included." size="xl">
        <div className="space-y-5">
          <FormGrid columns={3}>
            <TextInput label="Property Name" value={form.title} onChange={(value) => setForm({ ...form, title: value })} />
            <TextInput label="Building / Area Name" value={form.buildingName || ''} onChange={(value) => setForm({ ...form, buildingName: value })} />
            <TextInput label="Meta Title" value={form.metaTitle || ''} onChange={(value) => setForm({ ...form, metaTitle: value })} />
            <TextInput label="Slug" value={form.slug || ''} onChange={(value) => setForm({ ...form, slug: value })} />
            <TextInput label="Meta Description" value={form.metaDescription || ''} onChange={(value) => setForm({ ...form, metaDescription: value })} />
            <TextInput label="Meta Keywords" value={form.metaKeywords || ''} onChange={(value) => setForm({ ...form, metaKeywords: value })} />
            <TextInput label="Type" value={form.type || ''} onChange={(value) => setForm({ ...form, type: value })} />
            <TextInput label="Sub-Type" value={form.subType || ''} onChange={(value) => setForm({ ...form, subType: value })} />
            <TextInput label="Developer" value={form.developer || ''} onChange={(value) => setForm({ ...form, developer: value })} />
            <TextInput label="Developer Type" value={form.developerType || ''} onChange={(value) => setForm({ ...form, developerType: value })} />
            <TextInput label="Category" value={form.category} onChange={(value) => setForm({ ...form, category: value })} />
            <TextInput label="City" value={form.city || ''} onChange={(value) => setForm({ ...form, city: value })} />
            <TextInput label="Location" value={form.location} onChange={(value) => setForm({ ...form, location: value })} />
            <TextInput label="Address" value={form.address || ''} onChange={(value) => setForm({ ...form, address: value })} />
            <TextInput label="Property Status" value={form.propertyStatus || ''} onChange={(value) => setForm({ ...form, propertyStatus: value })} />
            <SelectInput label="Visibility" value={form.visibility || 'both'} onChange={(value) => setForm({ ...form, visibility: value as Property['visibility'] })} options={[{ label: 'Mobile', value: 'mobile' }, { label: 'Web', value: 'web' }, { label: 'Both', value: 'both' }]} />
            <TextInput label="Longitude" value={form.longitude || ''} onChange={(value) => setForm({ ...form, longitude: value })} />
            <TextInput label="Latitude" value={form.latitude || ''} onChange={(value) => setForm({ ...form, latitude: value })} />
            <TextInput label="Price" type="number" value={form.price} onChange={(value) => setForm({ ...form, price: Number(value) })} />
            <TextInput label="Bedrooms" type="number" value={form.bedrooms} onChange={(value) => setForm({ ...form, bedrooms: Number(value) })} />
            <TextInput label="Bathrooms" type="number" value={form.bathrooms} onChange={(value) => setForm({ ...form, bathrooms: Number(value) })} />
            <TextInput label="Sort Order" type="number" value={form.sortOrder || 0} onChange={(value) => setForm({ ...form, sortOrder: Number(value) })} />
            <TextInput label="Thumbnail URL" value={form.thumbnail || ''} onChange={(value) => setForm({ ...form, thumbnail: value })} />
            <TextInput label="Enquire Form Image" value={form.enquireFormImage || ''} onChange={(value) => setForm({ ...form, enquireFormImage: value })} />
            <SelectInput label="Status" value={form.status} onChange={(value) => setForm({ ...form, status: value as Property['status'] })} options={[{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }, { label: 'Draft', value: 'draft' }, { label: 'Ready', value: 'ready' }, { label: 'Sold', value: 'sold' }]} />
          </FormGrid>
          <FormGrid columns={2}>
            <TextArea label="Short Description" value={form.shortDescription || ''} onChange={(value) => setForm({ ...form, shortDescription: value })} />
            <TextArea label="App Description" value={form.appDescription || ''} onChange={(value) => setForm({ ...form, appDescription: value })} />
            <TextArea label="Full Description" value={form.fullDescription || ''} onChange={(value) => setForm({ ...form, fullDescription: value })} />
            <div className="space-y-3">
              <Toggle label="Active" checked={Boolean(form.active)} onChange={(value) => setForm({ ...form, active: value })} />
              <Toggle label="Hot Launch" checked={Boolean(form.hotLaunch)} onChange={(value) => setForm({ ...form, hotLaunch: value })} />
              <Toggle label="Exclusive" checked={Boolean(form.exclusive)} onChange={(value) => setForm({ ...form, exclusive: value })} />
              <Toggle label="Featured" checked={Boolean(form.featured)} onChange={(value) => setForm({ ...form, featured: value })} />
            </div>
          </FormGrid>
          <FormActions onSubmit={submit} onCancel={close} submitLabel={editingId ? 'Update Property' : 'Create Property'} />
        </div>
      </Modal>
    </DashboardShell>
  );
}
