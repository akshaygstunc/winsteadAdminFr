import { ReactNode } from 'react';
import clsx from 'clsx';

export function SectionCard({
  title,
  subtitle,
  action,
  children,
  className,
  button
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  button?: boolean
}) {
  return (
    <section className={clsx('card overflow-hidden', className)}>
      <div className="flex flex-col gap-3 border-b border-line px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function MetricTile({
  label,
  value,
  note,
}: {
  label: string;
  value: string | number;
  note: string;
}) {
  return (
    <div className="card relative overflow-hidden p-5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/80 to-transparent" />
      <p className="text-xs uppercase tracking-[0.28em] text-gold">{label}</p>
      <p className="mt-4 text-3xl font-semibold text-text">{value}</p>
      <p className="mt-3 text-sm leading-6 text-muted">{note}</p>
    </div>
  );
}

export function StatusBadge({
  value,
  tone,
}: {
  value: string;
  tone?: 'gold' | 'green' | 'violet' | 'slate' | 'red';
}) {
  const tones = {
    gold: 'border-gold/40 bg-gold/10 text-gold',
    green: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
    violet: 'border-violet-400/40 bg-violet-400/10 text-violet-300',
    slate: 'border-line bg-white/5 text-text',
    red: 'border-rose-400/40 bg-rose-400/10 text-rose-300',
  };
  return (
    <span
      className={clsx(
        'inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize tracking-wide',
        tones[tone || 'slate'],
      )}
    >
      {value.replaceAll('_', ' ')}
    </span>
  );
}

export function SimpleField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-panel/70 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-gold">{label}</p>
      <p className="mt-3 text-sm leading-6 text-text">{value}</p>
    </div>
  );
}

export function ActionButton({
  children,
  secondary,
  onClick,
}: {
  children: ReactNode;
  secondary?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      className={clsx(
        'rounded-2xl border px-4 py-2 text-sm font-medium transition',
        secondary
          ? 'border-line bg-panel text-text hover:border-gold/40'
          : 'border-gold/50 bg-gold/10 text-gold hover:bg-gold/20',
      )}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
