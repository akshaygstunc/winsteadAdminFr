'use client';
import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Header } from '@/components/header';
import { api } from '@/lib/api';
import { AssessmentRequest } from '@/lib/types';
import { SectionCard, StatusBadge } from '@/components/ui';
import { FormActions, FormGrid, InlineActions, SectionNotice, SelectInput, TextInput } from '@/components/crud-kit';

const emptyForm: AssessmentRequest = { name: '', city: '', budget: '', intent: '', stage: 'warm', avatar: '' };

export default function AssessmentRequestsPage() {
  const [items, setItems] = useState<AssessmentRequest[]>([]);
  const [form, setForm] = useState<AssessmentRequest>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = async () => { try { setItems(await api.get<AssessmentRequest[]>('/assessment-requests')); } catch { setError('Failed to load assessment requests.'); } };
  useEffect(() => { load(); }, []);
  const submit = async () => { try { if (editingId) await api.patch(`/assessment-requests/${editingId}`, form); else await api.post('/assessment-requests', form); setEditingId(null); setForm(emptyForm); setMessage('Assessment request saved.'); load(); } catch { setError('Unable to save assessment request.'); } };
  const edit = (item: AssessmentRequest) => { setForm(item); setEditingId(item._id || null); };
  const remove = async (id?: string) => { if (!id) return; try { await api.delete(`/assessment-requests/${id}`); setMessage('Assessment request deleted.'); load(); } catch { setError('Unable to delete assessment request.'); } };
  return (
    <DashboardShell>
      <Header title="Assessment Requests" subtitle="Create and manage inbound assessment requests." />
      <div className="space-y-6">
        <SectionCard title={editingId ? 'Edit Request' : 'Create Request'} subtitle="Capture intent, stage, budget, and city.">
          <div className="space-y-4">
            <SectionNotice message={message} error={error} />
            <FormGrid columns={3}>
              <TextInput label="Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
              <TextInput label="City" value={form.city} onChange={(value) => setForm({ ...form, city: value })} />
              <TextInput label="Budget" value={form.budget} onChange={(value) => setForm({ ...form, budget: value })} />
              <TextInput label="Intent" value={form.intent} onChange={(value) => setForm({ ...form, intent: value })} />
              <TextInput label="Avatar" value={form.avatar} onChange={(value) => setForm({ ...form, avatar: value })} />
              <SelectInput label="Stage" value={form.stage} onChange={(value) => setForm({ ...form, stage: value as AssessmentRequest['stage'] })} options={[{label:'Cold',value:'cold'},{label:'Warm',value:'warm'},{label:'Hot',value:'hot'}]} />
            </FormGrid>
            <FormActions onSubmit={submit} onCancel={editingId ? () => { setEditingId(null); setForm(emptyForm); } : undefined} submitLabel={editingId ? 'Update Request' : 'Create Request'} />
          </div>
        </SectionCard>
        <SectionCard title="Request Grid" subtitle="Saved requests render here instantly.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
            {items.map((request) => (
              <div key={request._id} className="rounded-[28px] border border-line bg-panel/60 p-5">
                <div className="flex items-start justify-between"><div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-white/5 font-semibold text-gold">{request.avatar}</div><StatusBadge value={request.stage} tone={request.stage === 'hot' ? 'green' : request.stage === 'warm' ? 'gold' : 'slate'} /></div>
                <h3 className="mt-5 text-base font-semibold text-text">{request.name}</h3>
                <p className="mt-2 text-sm text-muted">{request.city}</p>
                <div className="mt-5 grid gap-3">
                  <div className="rounded-2xl border border-line bg-card/80 p-3"><p className="text-xs uppercase tracking-[0.24em] text-gold">Budget</p><p className="mt-2 text-sm text-text">{request.budget}</p></div>
                  <div className="rounded-2xl border border-line bg-card/80 p-3"><p className="text-xs uppercase tracking-[0.24em] text-gold">Intent</p><p className="mt-2 text-sm text-text">{request.intent}</p></div>
                </div>
                <div className="mt-4"><InlineActions onEdit={() => edit(request)} onDelete={() => remove(request._id)} /></div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </DashboardShell>
  );
}
