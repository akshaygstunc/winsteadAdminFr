'use client';
import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Header } from '@/components/header';
import { DataTable } from '@/components/data-table';
import { api } from '@/lib/api';
import { FieldMapping } from '@/lib/types';
import { ActionButton, SectionCard, StatusBadge } from '@/components/ui';
import { CheckboxInput, FormActions, FormGrid, InlineActions, SectionNotice, TextArea, TextInput } from '@/components/crud-kit';
import { Modal } from '@/components/modal';

const emptyForm: FieldMapping = { sourceField: '', targetField: '', sourceType: '', targetType: '', active: true, notes: '' };

export default function FieldsToLeadPage() {
  const [items, setItems] = useState<FieldMapping[]>([]);
  const [form, setForm] = useState<FieldMapping>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => { try { setItems(await api.get<FieldMapping[]>('/field-mappings')); } catch { setError('Failed to load fields to lead.'); } };
  useEffect(() => { load(); }, []);
  const close = () => { setEditingId(null); setForm(emptyForm); setOpen(false); };
  const submit = async () => {
    try {
      if (editingId) await api.patch(`/field-mappings/${editingId}`, form); else await api.post('/field-mappings', form);
      setMessage(editingId ? 'Mapping updated.' : 'Mapping created.');
      close();
      load();
    } catch { setError('Unable to save mapping.'); }
  };
  const edit = (item: FieldMapping) => { setForm(item); setEditingId(item._id || null); setOpen(true); };
  const remove = async (id?: string) => { if (!id) return; try { await api.delete(`/field-mappings/${id}`); setMessage('Mapping deleted.'); load(); } catch { setError('Unable to delete mapping.'); } };

  return (
    <DashboardShell>
      <Header title="Fields to Lead" subtitle="Add, edit, and delete forms now open properly in modal drawers." />
      <div className="space-y-6">
        <SectionNotice message={message} error={error} />
        <SectionCard title="Fields to Lead" subtitle="MongoDB-backed records with working form actions." action={<ActionButton onClick={() => setOpen(true)}>Add Mapping</ActionButton>}>
          <DataTable headers={['Source', 'Target', 'Source Type', 'Target Type', 'Active', 'Notes', 'Actions']}>
            {items.map((item) => (
              <tr key={item._id} className="border-t border-line text-sm text-muted">
                <td className="px-5 py-4 text-text">{item.sourceField}</td>
                <td className="px-5 py-4">{item.targetField}</td>
                <td className="px-5 py-4">{item.sourceType}</td>
                <td className="px-5 py-4">{item.targetType}</td>
                <td className="px-5 py-4"><StatusBadge value={item.active ? 'active' : 'inactive'} tone={item.active ? 'green' : 'slate'} /></td>
                <td className="px-5 py-4">{item.notes || '--'}</td>
                <td className="px-5 py-4"><InlineActions onEdit={() => edit(item)} onDelete={() => remove(item._id)} /></td>
              </tr>
            ))}
          </DataTable>
        </SectionCard>
      </div>
      <Modal open={open} onClose={close} title={editingId ? 'Edit Mapping' : 'Add Mapping'} subtitle="Form actions are now connected and visible." size="xl">
        <div className="space-y-4">
            <FormGrid columns={2}>
              <TextInput label="Source Field" value={form.sourceField} onChange={(value) => setForm({ ...form, sourceField: value })} />
              <TextInput label="Target Field" value={form.targetField} onChange={(value) => setForm({ ...form, targetField: value })} />
              <TextInput label="Source Type" value={form.sourceType} onChange={(value) => setForm({ ...form, sourceType: value })} />
              <TextInput label="Target Type" value={form.targetType} onChange={(value) => setForm({ ...form, targetType: value })} />
              <TextArea label="Notes" value={form.notes || ''} onChange={(value) => setForm({ ...form, notes: value })} />
              <div className="flex items-end"><CheckboxInput label="Active mapping" checked={form.active} onChange={(value) => setForm({ ...form, active: value })} /></div>
            </FormGrid>
            <FormActions onSubmit={submit} onCancel={close} submitLabel={editingId ? 'Update Mapping' : 'Create Mapping'} />
        </div>
      </Modal>
    </DashboardShell>
  );
}
