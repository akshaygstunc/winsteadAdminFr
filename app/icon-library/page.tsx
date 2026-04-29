'use client';
import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Header } from '@/components/header';
import { api } from '@/lib/api';
import { IconItem } from '@/lib/types';
import { SectionCard } from '@/components/ui';
import { FormActions, FormGrid, InlineActions, SectionNotice, TextInput } from '@/components/crud-kit';

const emptyForm: IconItem = { label: '', glyph: '', category: '' };

export default function IconLibraryPage() {
  const [items, setItems] = useState<IconItem[]>([]);
  const [form, setForm] = useState<IconItem>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = async () => { try { setItems(await api.get<IconItem[]>('/icons')); } catch { setError('Failed to load icons.'); } };
  useEffect(() => { load(); }, []);
  const submit = async () => { try { if (editingId) await api.patch(`/icons/${editingId}`, form); else await api.post('/icons', form); setEditingId(null); setForm(emptyForm); setMessage('Icon saved.'); load(); } catch { setError('Unable to save icon.'); } };
  const edit = (item: IconItem) => { setForm(item); setEditingId(item._id || null); };
  const remove = async (id?: string) => { if (!id) return; try { await api.delete(`/icons/${id}`); setMessage('Icon deleted.'); load(); } catch { setError('Unable to delete icon.'); } };
  return (
    <DashboardShell>
      <Header title="Icon Library" subtitle="Maintain amenity and dashboard icons with full CRUD." />
      <div className="space-y-6">
        <SectionCard title={editingId ? 'Edit Icon' : 'Create Icon'} subtitle="Add a label, glyph, and category.">
          <div className="space-y-4">
            <SectionNotice message={message} error={error} />
            <FormGrid columns={3}>
              <TextInput label="Label" value={form.label} onChange={(value) => setForm({ ...form, label: value })} />
              <TextInput label="Glyph" value={form.glyph} onChange={(value) => setForm({ ...form, glyph: value })} />
              <TextInput label="Category" value={form.category || ''} onChange={(value) => setForm({ ...form, category: value })} />
            </FormGrid>
            <FormActions onSubmit={submit} onCancel={editingId ? () => { setEditingId(null); setForm(emptyForm); } : undefined} submitLabel={editingId ? 'Update Icon' : 'Create Icon'} />
          </div>
        </SectionCard>
        <SectionCard title="Available Icons" subtitle="Live icon matrix powered by MongoDB.">
          <div className="grid grid-cols-4 gap-3 md:grid-cols-6 xl:grid-cols-10">
            {items.map((icon) => (
              <div key={icon._id} className="rounded-3xl border border-line bg-panel/60 p-3 text-center">
                <div className="flex h-16 items-center justify-center text-2xl">{icon.glyph}</div>
                <span className="block text-[11px] text-muted">{icon.label}</span>
                <span className="mt-1 block text-[10px] uppercase tracking-[0.2em] text-gold">{icon.category || 'general'}</span>
                <div className="mt-3"><InlineActions onEdit={() => edit(icon)} onDelete={() => remove(icon._id)} /></div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </DashboardShell>
  );
}
