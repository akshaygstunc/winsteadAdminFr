'use client';
import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Header } from '@/components/header';
import { api } from '@/lib/api';
import { Assessment } from '@/lib/types';
import { ActionButton, SectionCard, StatusBadge } from '@/components/ui';
import { DataTable } from '@/components/data-table';
import { FormActions, FormGrid, InlineActions, SectionNotice, SelectInput, TextInput } from '@/components/crud-kit';
import { Modal } from '@/components/modal';

const emptyForm: Assessment = { title: '', owner: '', property: '', requestedAt: '', status: 'pending' };

export default function PendingAssessmentsPage() {
  const [items, setItems] = useState<Assessment[]>([]);
  const [form, setForm] = useState<Assessment>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => { try { setItems(await api.get<Assessment[]>('/pending-assessments')); } catch { setError('Failed to load pending assessments.'); } };
  useEffect(() => { load(); }, []);
  const close = () => { setEditingId(null); setForm(emptyForm); setOpen(false); };
  const submit = async () => {
    try {
      if (editingId) await api.patch(`/pending-assessments/${editingId}`, form); else await api.post('/pending-assessments', form);
      setMessage(editingId ? 'Assessment updated.' : 'Assessment created.');
      close();
      load();
    } catch { setError('Unable to save assessment.'); }
  };
  const edit = (item: Assessment) => { setForm(item); setEditingId(item._id || null); setOpen(true); };
  const remove = async (id?: string) => { if (!id) return; try { await api.delete(`/pending-assessments/${id}`); setMessage('Assessment deleted.'); load(); } catch { setError('Unable to delete assessment.'); } };

  return (
    <DashboardShell>
      <Header title="Pending Assessments" subtitle="Add, edit, and delete forms now open properly in modal drawers." />
      <div className="space-y-6">
        <SectionNotice message={message} error={error} />
        <SectionCard title="Pending Assessments" subtitle="MongoDB-backed records with working form actions." action={<ActionButton onClick={() => setOpen(true)}>Add Assessment</ActionButton>}>
          <DataTable headers={['Title', 'Owner', 'Property', 'Requested At', 'Status', 'Actions']}>
            {items.map((item) => (
              <tr key={item._id} className="border-t border-line text-sm text-muted">
                <td className="px-5 py-4 text-text">{item.title}</td>
                <td className="px-5 py-4">{item.owner}</td>
                <td className="px-5 py-4">{item.property}</td>
                <td className="px-5 py-4">{item.requestedAt}</td>
                <td className="px-5 py-4"><StatusBadge value={item.status} tone={item.status === 'completed' ? 'green' : item.status === 'scheduled' ? 'gold' : 'slate'} /></td>
                <td className="px-5 py-4"><InlineActions onEdit={() => edit(item)} onDelete={() => remove(item._id)} /></td>
              </tr>
            ))}
          </DataTable>
        </SectionCard>
      </div>
      <Modal open={open} onClose={close} title={editingId ? 'Edit Assessment' : 'Add Assessment'} subtitle="Form actions are now connected and visible." size="xl">
        <div className="space-y-4">
            <FormGrid columns={3}>
              <TextInput label="Title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} />
              <TextInput label="Owner" value={form.owner} onChange={(value) => setForm({ ...form, owner: value })} />
              <TextInput label="Property" value={form.property} onChange={(value) => setForm({ ...form, property: value })} />
              <TextInput label="Requested At" value={form.requestedAt} onChange={(value) => setForm({ ...form, requestedAt: value })} />
              <SelectInput label="Status" value={form.status} onChange={(value) => setForm({ ...form, status: value as Assessment['status'] })} options={[{label:'Pending',value:'pending'},{label:'Scheduled',value:'scheduled'},{label:'Completed',value:'completed'}]} />
            </FormGrid>
            <FormActions onSubmit={submit} onCancel={close} submitLabel={editingId ? 'Update Assessment' : 'Create Assessment'} />
        </div>
      </Modal>
    </DashboardShell>
  );
}
