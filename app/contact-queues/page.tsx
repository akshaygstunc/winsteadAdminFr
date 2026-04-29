'use client';
import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Header } from '@/components/header';
import { DataTable } from '@/components/data-table';
import { api } from '@/lib/api';
import { ContactQueueItem } from '@/lib/types';
import { ActionButton, SectionCard, StatusBadge } from '@/components/ui';
import { FormActions, FormGrid, InlineActions, SectionNotice, SelectInput, TextInput } from '@/components/crud-kit';
import { Modal } from '@/components/modal';

const emptyForm: ContactQueueItem = { title: '', category: '', owner: '', updatedAt: '', status: 'draft', priority: 'medium' };

export default function ContactQueuesPage() {
  const [items, setItems] = useState<ContactQueueItem[]>([]);
  const [form, setForm] = useState<ContactQueueItem>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => { try { setItems(await api.get<ContactQueueItem[]>('/contact-queues')); } catch { setError('Failed to load contact queues.'); } };
  useEffect(() => { load(); }, []);
  const close = () => { setEditingId(null); setForm(emptyForm); setOpen(false); };
  const submit = async () => {
    try {
      if (editingId) await api.patch(`/contact-queues/${editingId}`, form); else await api.post('/contact-queues', form);
      setMessage(editingId ? 'Queue Item updated.' : 'Queue Item created.');
      close();
      load();
    } catch { setError('Unable to save queue item.'); }
  };
  const edit = (item: ContactQueueItem) => { setForm(item); setEditingId(item._id || null); setOpen(true); };
  const remove = async (id?: string) => { if (!id) return; try { await api.delete(`/contact-queues/${id}`); setMessage('Queue Item deleted.'); load(); } catch { setError('Unable to delete queue item.'); } };

  return (
    <DashboardShell>
      <Header title="Contact Queues" subtitle="Add, edit, and delete forms now open properly in modal drawers." />
      <div className="space-y-6">
        <SectionNotice message={message} error={error} />
        <SectionCard title="Contact Queues" subtitle="MongoDB-backed records with working form actions." action={<ActionButton onClick={() => setOpen(true)}>Add Queue Item</ActionButton>}>
          <DataTable headers={['Title', 'Category', 'Owner', 'Updated', 'Priority', 'Status', 'Actions']}>
            {items.map((item) => (
              <tr key={item._id} className="border-t border-line text-sm text-muted">
                <td className="px-5 py-4 text-text">{item.title}</td>
                <td className="px-5 py-4">{item.category}</td>
                <td className="px-5 py-4">{item.owner}</td>
                <td className="px-5 py-4">{item.updatedAt}</td>
                <td className="px-5 py-4"><StatusBadge value={item.priority} tone={item.priority === 'high' ? 'red' : item.priority === 'medium' ? 'gold' : 'slate'} /></td>
                <td className="px-5 py-4"><StatusBadge value={item.status} tone={item.status === 'published' ? 'green' : item.status === 'ready' ? 'gold' : 'slate'} /></td>
                <td className="px-5 py-4"><InlineActions onEdit={() => edit(item)} onDelete={() => remove(item._id)} /></td>
              </tr>
            ))}
          </DataTable>
        </SectionCard>
      </div>
      <Modal open={open} onClose={close} title={editingId ? 'Edit Queue Item' : 'Add Queue Item'} subtitle="Form actions are now connected and visible." size="xl">
        <div className="space-y-4">
            <FormGrid columns={3}>
              <TextInput label="Title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} />
              <TextInput label="Category" value={form.category} onChange={(value) => setForm({ ...form, category: value })} />
              <TextInput label="Owner" value={form.owner} onChange={(value) => setForm({ ...form, owner: value })} />
              <TextInput label="Updated At" value={form.updatedAt} onChange={(value) => setForm({ ...form, updatedAt: value })} />
              <SelectInput label="Priority" value={form.priority} onChange={(value) => setForm({ ...form, priority: value as ContactQueueItem['priority'] })} options={[{label:'Low',value:'low'},{label:'Medium',value:'medium'},{label:'High',value:'high'}]} />
              <SelectInput label="Status" value={form.status} onChange={(value) => setForm({ ...form, status: value as ContactQueueItem['status'] })} options={[{label:'Draft',value:'draft'},{label:'Review',value:'review'},{label:'Ready',value:'ready'},{label:'Published',value:'published'}]} />
            </FormGrid>
            <FormActions onSubmit={submit} onCancel={close} submitLabel={editingId ? 'Update Queue Item' : 'Create Queue Item'} />
        </div>
      </Modal>
    </DashboardShell>
  );
}
