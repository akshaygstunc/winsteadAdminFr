import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard-shell';
import { Header } from '@/components/header';

const cards = [
  { href: '/helpdesk/tickets', title: 'Tickets', desc: 'Inbound support tickets, priorities, owners, and SLA tracking.' },
  { href: '/helpdesk/faqs', title: 'FAQs', desc: 'Support knowledge base and reusable answer content.' },
];

export default function Page() {
  return (
    <DashboardShell>
      <Header title="Helpdesk" subtitle="Support routes grouped with a stable parent page for the rebuilt menu tree." />
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
