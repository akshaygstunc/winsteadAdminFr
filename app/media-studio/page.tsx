'use client';
import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Header } from '@/components/header';
import { api } from '@/lib/api';
import { BrandAsset } from '@/lib/types';
import { SectionCard, StatusBadge } from '@/components/ui';
import { FormActions, FormGrid, InlineActions, SectionNotice, TextInput } from '@/components/crud-kit';

const emptyForm: BrandAsset = { name: '', type: '', updatedAt: '', size: '', url: '' };

export default function MediaStudioPage() {
  const [items, setItems] = useState<BrandAsset[]>([]);
  const [form, setForm] = useState<BrandAsset>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = async () => { try { setItems(await api.get<BrandAsset[]>('/media-assets')); } catch { setError('Failed to load media assets.'); } };
  useEffect(() => { load(); }, []);
  const submit = async () => { try { if (editingId) await api.patch(`/media-assets/${editingId}`, form); else await api.post('/media-assets', form); setEditingId(null); setForm(emptyForm); setMessage('Asset saved.'); load(); } catch { setError('Unable to save asset.'); } };
  const edit = (item: BrandAsset) => { setForm(item); setEditingId(item._id || null); };
  const remove = async (id?: string) => { if (!id) return; try { await api.delete(`/media-assets/${id}`); setMessage('Asset deleted.'); load(); } catch { setError('Unable to delete asset.'); } };
  return (
    <DashboardShell>
      <Header title="Media Studio" subtitle="Manage media assets with full CRUD persistence." />
      <div className="space-y-6">
        <SectionCard title={editingId ? 'Edit Asset' : 'Register Asset'} subtitle="Store asset metadata, type, size, and source URL.">
          <div className="space-y-4">
            <SectionNotice message={message} error={error} />
            <FormGrid columns={3}>
              <TextInput label="Asset Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
              <TextInput label="Asset Type" value={form.type} onChange={(value) => setForm({ ...form, type: value })} />
              <TextInput label="Updated At" value={form.updatedAt} onChange={(value) => setForm({ ...form, updatedAt: value })} />
              <TextInput label="Size" value={form.size} onChange={(value) => setForm({ ...form, size: value })} />
              <TextInput label="URL" value={form.url || ''} onChange={(value) => setForm({ ...form, url: value })} />
            </FormGrid>
            <FormActions onSubmit={submit} onCancel={editingId ? () => { setEditingId(null); setForm(emptyForm); } : undefined} submitLabel={editingId ? 'Update Asset' : 'Create Asset'} />
          </div>
        </SectionCard>
        <SectionCard title="Recent Assets" subtitle="Your saved library is backed by MongoDB.">
          <div className="space-y-3">
            {items.map((asset) => (
              <div key={asset._id} className="flex flex-col gap-3 rounded-2xl border border-line bg-panel/60 p-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-sm font-medium text-text">{asset.name}</p>
                  <p className="mt-1 text-xs text-muted">{asset.updatedAt} • {asset.size}</p>
                  {asset.url ? <p className="mt-1 text-xs text-muted">{asset.url}</p> : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge value={asset.type} tone="gold" />
                  <InlineActions onEdit={() => edit(asset)} onDelete={() => remove(asset._id)} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </DashboardShell>
  );
}
