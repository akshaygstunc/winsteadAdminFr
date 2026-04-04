'use client';
import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Header } from '@/components/header';
import { api } from '@/lib/api';
import { ScreeningQuestion } from '@/lib/types';
import { SectionCard, StatusBadge } from '@/components/ui';
import { CheckboxInput, FormActions, FormGrid, InlineActions, SectionNotice, SelectInput, TextArea, TextInput } from '@/components/crud-kit';

const emptyForm: ScreeningQuestion = { label: '', type: 'text', required: false, helper: '', options: [] };

export default function ScreeningQuestionsPage() {
  const [items, setItems] = useState<ScreeningQuestion[]>([]);
  const [form, setForm] = useState<ScreeningQuestion>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = async () => { try { setItems(await api.get<ScreeningQuestion[]>('/screening-questions')); } catch { setError('Failed to load screening questions.'); } };
  useEffect(() => { load(); }, []);
  const submit = async () => {
    const payload = { ...form, options: (form.options || []).filter(Boolean) };
    try { if (editingId) await api.patch(`/screening-questions/${editingId}`, payload); else await api.post('/screening-questions', payload); setEditingId(null); setForm(emptyForm); setMessage('Question saved.'); load(); } catch { setError('Unable to save screening question.'); }
  };
  const edit = (item: ScreeningQuestion) => { setForm({ ...item, options: item.options || [] }); setEditingId(item._id || null); };
  const remove = async (id?: string) => { if (!id) return; try { await api.delete(`/screening-questions/${id}`); setMessage('Question deleted.'); load(); } catch { setError('Unable to delete screening question.'); } };
  return (
    <DashboardShell>
      <Header title="Screening Questions" subtitle="Question builder with create, edit, and delete persistence." />
      <div className="space-y-6">
        <SectionCard title={editingId ? 'Edit Question' : 'Create Question'} subtitle="Build the exact concierge qualification flow.">
          <div className="space-y-4">
            <SectionNotice message={message} error={error} />
            <FormGrid columns={2}>
              <TextInput label="Label" value={form.label} onChange={(value) => setForm({ ...form, label: value })} />
              <SelectInput label="Type" value={form.type} onChange={(value) => setForm({ ...form, type: value as ScreeningQuestion['type'] })} options={[{label:'Text',value:'text'},{label:'Textarea',value:'textarea'},{label:'Select',value:'select'},{label:'Toggle',value:'toggle'}]} />
              <TextArea label="Helper Text" value={form.helper || ''} onChange={(value) => setForm({ ...form, helper: value })} />
              <TextArea label="Options (comma separated)" value={(form.options || []).join(', ')} onChange={(value) => setForm({ ...form, options: value.split(',').map((part) => part.trim()).filter(Boolean) })} />
              <div className="flex items-end"><CheckboxInput label="Required question" checked={form.required} onChange={(value) => setForm({ ...form, required: value })} /></div>
            </FormGrid>
            <FormActions onSubmit={submit} onCancel={editingId ? () => { setEditingId(null); setForm(emptyForm); } : undefined} submitLabel={editingId ? 'Update Question' : 'Create Question'} />
          </div>
        </SectionCard>
        <SectionCard title="Question Builder" subtitle="Persisted questions are listed below.">
          <div className="space-y-4">
            {items.map((question, index) => (
              <div key={question._id} className="rounded-[28px] border border-line bg-panel/60 p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-gold">Question {index + 1}</p>
                    <h3 className="mt-3 text-base font-semibold text-text">{question.label}</h3>
                    {question.helper ? <p className="mt-2 text-sm text-muted">{question.helper}</p> : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge value={question.type} tone="violet" />
                    <StatusBadge value={question.required ? 'required' : 'optional'} tone={question.required ? 'gold' : 'slate'} />
                    <InlineActions onEdit={() => edit(question)} onDelete={() => remove(question._id)} />
                  </div>
                </div>
                {question.options?.length ? <div className="mt-4 flex flex-wrap gap-2">{question.options.map((option) => <span key={option} className="rounded-full border border-line bg-card px-3 py-1 text-xs text-text">{option}</span>)}</div> : null}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </DashboardShell>
  );
}
