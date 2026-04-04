'use client';
import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Header } from '@/components/header';
import { DataTable } from '@/components/data-table';
import { api } from '@/lib/api';
import { Lead } from '@/lib/types';
import { ActionButton, SectionCard, StatusBadge } from '@/components/ui';
import { Modal } from '@/components/modal';
import { FormActions, FormGrid, InlineActions, SectionNotice, SelectInput, TextInput } from '@/components/crud-kit';

const emptyForm: Lead = { name: '', email: '', phone: '', source: '', status: 'new', budget: 0, stage: '', lastTouch: '', assignedTo: '' };

export default function LeadsPage() {
  const [items, setItems] = useState<Lead[]>([]);
  const [form, setForm] = useState<Lead>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = async () => { try { setItems(await api.get<Lead[]>('/leads')); } catch { setError('Failed to load leads.'); } };
  useEffect(() => { load(); }, []);
  const close = () => { setOpen(false); setEditingId(null); setForm(emptyForm); };
  const submit = async () => {
    try {
      if (editingId) await api.patch(`/leads/${editingId}`, form); else await api.post('/leads', form);
      setMessage(editingId ? 'Lead updated.' : 'Lead created.');
      close();
      load();
    } catch { setError('Unable to save lead.'); }
  };
  const edit = (item: Lead) => { setForm(item); setEditingId(item._id || null); setOpen(true); };
  const remove = async (id?: string) => { if (!id) return; try { await api.delete(`/leads/${id}`); setMessage('Lead deleted.'); load(); } catch { setError('Unable to delete lead.'); } };
  return (
    <DashboardShell>
      <Header title="Leads" subtitle="Lead management screen with working add/edit modal forms." />
      <SectionNotice message={message} error={error} />
      <SectionCard title="Lead Table" subtitle="Luxury-styled CRM ledger." action={<ActionButton onClick={() => setOpen(true)}>Add Lead</ActionButton>}>
        <DataTable headers={['Lead', 'Source', 'Budget', 'Stage', 'Assigned', 'Status', 'Actions']}>
          {items.map((lead) => (
            <tr key={lead._id || lead.name} className="border-t border-line text-sm text-muted">
              <td className="px-5 py-4"><div><p className="text-text">{lead.name}</p><p className="mt-1 text-xs text-muted">{lead.email}</p></div></td>
              <td className="px-5 py-4">{lead.source}</td>
              <td className="px-5 py-4">{lead.budget ? `$${lead.budget.toLocaleString()}` : '--'}</td>
              <td className="px-5 py-4">{lead.stage || '--'}</td>
              <td className="px-5 py-4">{lead.assignedTo || '--'}</td>
              <td className="px-5 py-4"><StatusBadge value={lead.status} tone={lead.status === 'won' ? 'green' : lead.status === 'qualified' ? 'gold' : lead.status === 'lost' ? 'red' : 'slate'} /></td>
              <td className="px-5 py-4"><InlineActions onEdit={() => edit(lead)} onDelete={() => remove(lead._id)} /></td>
            </tr>
          ))}
        </DataTable>
      </SectionCard>
      <Modal open={open} onClose={close} title={editingId ? 'Edit Lead' : 'Add Lead'} subtitle="Lead create and update form." size="xl">
        <div className="space-y-4">
          <FormGrid columns={3}>
            <TextInput label="Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
            <TextInput label="Email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
            <TextInput label="Phone" value={form.phone || ''} onChange={(value) => setForm({ ...form, phone: value })} />
            <TextInput label="Source" value={form.source} onChange={(value) => setForm({ ...form, source: value })} />
            <TextInput label="Budget" type="number" value={form.budget || 0} onChange={(value) => setForm({ ...form, budget: Number(value) })} />
            <TextInput label="Stage" value={form.stage || ''} onChange={(value) => setForm({ ...form, stage: value })} />
            <TextInput label="Assigned To" value={form.assignedTo || ''} onChange={(value) => setForm({ ...form, assignedTo: value })} />
            <TextInput label="Last Touch" value={form.lastTouch || ''} onChange={(value) => setForm({ ...form, lastTouch: value })} />
            <SelectInput label="Status" value={form.status} onChange={(value) => setForm({ ...form, status: value as Lead['status'] })} options={[{label:'New',value:'new'},{label:'Qualified',value:'qualified'},{label:'Follow Up',value:'follow_up'},{label:'Won',value:'won'},{label:'Lost',value:'lost'}]} />
          </FormGrid>
          <FormActions onSubmit={submit} onCancel={close} submitLabel={editingId ? 'Update Lead' : 'Create Lead'} />
        </div>
      </Modal>
    </DashboardShell>
  );
}
