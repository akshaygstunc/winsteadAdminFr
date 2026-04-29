'use client';
import { ReactNode } from 'react';
import clsx from 'clsx';

export function FormGrid({ children, columns = 2 }: { children: ReactNode; columns?: 1 | 2 | 3 }) {
  const map = { 1: 'grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-2 xl:grid-cols-3' };
  return <div className={clsx('grid gap-4', map[columns])}>{children}</div>;
}

export function FieldLabel({ label }: { label: string }) {
  return <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-gold">{label}</label>;
}

export function TextInput({ label, value, onChange, placeholder, type = 'text', multiple = false, min }: { label: string; value: string | number; onChange: (value: string) => void; placeholder?: string; type?: string; multiple?: boolean }) {
  return (
    <div>
      <FieldLabel label={label} />
      {type == "number" ? <input className="input" value={value} type={type} placeholder={placeholder} min={0} multiple={multiple} onChange={(e) => onChange(e.target.value)} /> : <input className="input" value={value} type={type} placeholder={placeholder} multiple={multiple} onChange={(e) => onChange(e.target.value)} />}


    </div>
  );
}

export function TextArea({ label, value, onChange, rows = 4 }: { label: string; value: string; onChange: (value: string) => void; rows?: number; }) {
  return (
    <div>
      <FieldLabel label={label} />
      <textarea className="input min-h-[120px] resize-y" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function SelectInput({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: { label: string; value: string }[]; }) {
  return (
    <div>
      <FieldLabel label={label} />
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
  );
}

export function CheckboxInput({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-line bg-panel px-4 py-3 text-sm text-text">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export function FormActions({ onSubmit, onCancel, submitLabel, busy }: { onSubmit: () => void; onCancel?: () => void; submitLabel: string; busy?: boolean; }) {
  return (
    <div className="flex flex-wrap gap-3">
      <button className="rounded-2xl border border-gold/50 bg-gold/10 px-4 py-2 text-gold text-sm font-medium    transition hover:bg-gold/20" onClick={onSubmit} type="button">
        {busy ? 'Saving...' : submitLabel}
      </button>
      {onCancel ? <button className="rounded-2xl border border-line bg-transparent px-4 py-2 text-sm text-muted" onClick={onCancel} type="button">Cancel</button> : null}
    </div>
  );
}

export function InlineActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex gap-2">
      {onEdit && <button className="rounded-xl border border-line px-3 py-1 text-xs text-text" onClick={onEdit} type="button">Edit</button>}
      {onDelete && <button className="rounded-xl border border-rose-400/30 px-3 py-1 text-xs text-rose-300" onClick={onDelete} type="button">Delete</button>}
    </div>
  );
}

export function SectionNotice({ message, error }: { message?: string | null; error?: string | null }) {
  if (!message && !error) return null;
  return <div className={clsx('rounded-2xl border px-4 py-3 text-sm', error ? 'border-rose-400/30 bg-rose-400/10 text-rose-200' : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200')}>{error || message}</div>;
}
