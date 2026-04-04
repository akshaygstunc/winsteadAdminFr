'use client';
import { useEffect, useMemo, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Header } from '@/components/header';
import { api } from '@/lib/api';
import { TaskCard } from '@/lib/types';
import { SectionCard } from '@/components/ui';
import { FormActions, FormGrid, InlineActions, SectionNotice, SelectInput, TextArea, TextInput } from '@/components/crud-kit';

const columns = [
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'approved', label: 'Approved' },
] as const;
const emptyForm: TaskCard = { title: '', description: '', owner: '', dueDate: '', status: 'todo' };

export default function TaskBoardPage() {
  const [items, setItems] = useState<TaskCard[]>([]);
  const [form, setForm] = useState<TaskCard>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = async () => { try { setItems(await api.get<TaskCard[]>('/tasks')); } catch { setError('Failed to load tasks.'); } };
  useEffect(() => { load(); }, []);
  const grouped = useMemo(() => columns.map((column) => ({ ...column, items: items.filter((task) => task.status === column.key) })), [items]);
  const submit = async () => { try { if (editingId) await api.patch(`/tasks/${editingId}`, form); else await api.post('/tasks', form); setEditingId(null); setForm(emptyForm); setMessage('Task saved.'); load(); } catch { setError('Unable to save task.'); } };
  const edit = (item: TaskCard) => { setForm(item); setEditingId(item._id || null); };
  const remove = async (id?: string) => { if (!id) return; try { await api.delete(`/tasks/${id}`); setMessage('Task deleted.'); load(); } catch { setError('Unable to delete task.'); } };
  return (
    <DashboardShell>
      <Header title="Task Board" subtitle="Kanban board with persisted task CRUD." />
      <div className="space-y-6">
        <SectionCard title={editingId ? 'Edit Task' : 'Create Task'} subtitle="Move work across the board with MongoDB persistence.">
          <div className="space-y-4">
            <SectionNotice message={message} error={error} />
            <FormGrid columns={3}>
              <TextInput label="Title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} />
              <TextInput label="Owner" value={form.owner} onChange={(value) => setForm({ ...form, owner: value })} />
              <TextInput label="Due Date" value={form.dueDate} onChange={(value) => setForm({ ...form, dueDate: value })} />
              <SelectInput label="Status" value={form.status} onChange={(value) => setForm({ ...form, status: value as TaskCard['status'] })} options={[{label:'To Do',value:'todo'},{label:'In Progress',value:'in_progress'},{label:'Approved',value:'approved'}]} />
              <div className="md:col-span-2"><TextArea label="Description" value={form.description} onChange={(value) => setForm({ ...form, description: value })} rows={3} /></div>
            </FormGrid>
            <FormActions onSubmit={submit} onCancel={editingId ? () => { setEditingId(null); setForm(emptyForm); } : undefined} submitLabel={editingId ? 'Update Task' : 'Create Task'} />
          </div>
        </SectionCard>
        <SectionCard title="Operations Board" subtitle="Tasks grouped live by status.">
          <div className="grid gap-4 xl:grid-cols-3">
            {grouped.map((column) => (
              <div key={column.key} className="rounded-[28px] border border-line bg-panel/50 p-4">
                <div className="mb-4 flex items-center justify-between"><h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">{column.label}</h3><span className="rounded-full border border-line px-3 py-1 text-xs text-text">{column.items.length}</span></div>
                <div className="space-y-3">
                  {column.items.map((task) => (
                    <div key={task._id} className="rounded-3xl border border-line bg-card/80 p-4">
                      <p className="text-sm font-semibold text-text">{task.title}</p>
                      <p className="mt-2 text-sm leading-6 text-muted">{task.description}</p>
                      <div className="mt-4 flex items-center justify-between text-xs text-muted"><span>{task.owner}</span><span>{task.dueDate}</span></div>
                      <div className="mt-4"><InlineActions onEdit={() => edit(task)} onDelete={() => remove(task._id)} /></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </DashboardShell>
  );
}
