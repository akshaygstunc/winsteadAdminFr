import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard-shell';
import { Header } from '@/components/header';

const cards = [
  { href: '/sales/manage-sales', title: 'Manage Sales', desc: 'Pipeline, sale entries, token tracking, and closure flow.' },
  { href: '/sales/clients', title: 'Clients', desc: 'Client CRM with property actions, reminders, and notes.' },
];

export default function Page() {
  return (
    <DashboardShell>
      <Header title="Sales" subtitle="CRM and sales management routes grouped under one working parent page." />
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="rounded-[28px] border border-line bg-panel/70 p-6 transition hover:border-gold/50 hover:bg-panel">
            <p className="text-xs uppercase tracking-[0.24em] text-gold">Module</p>
            <h2 className="mt-3 text-xl font-semibold text-text">{card.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{card.desc}</p>
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}
