import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard-shell';
import { Header } from '@/components/header';

const cards = [
  { href: '/customization/testimonials', title: 'Testimonials', desc: 'Review cards with rating and profile image rules.' },
  { href: '/customization/faq', title: 'FAQ', desc: 'Frequently asked questions with ordering and publish state.' },
  { href: '/customization/property-types', title: 'Property Types', desc: 'Top-level types with icon picker support.' },
  { href: '/customization/property-sub-types', title: 'Property Sub-Types', desc: 'Subtype metadata and active state.' },
  { href: '/customization/feature-icons', title: 'Feature Icons', desc: 'Visual icon master used in property features.' },
  { href: '/customization/locations', title: 'Locations', desc: 'City and sub-city hierarchy management.' },
  { href: '/customization/awards', title: 'Awards', desc: 'Awards with image, transparent image, and video support.' },
  { href: '/customization/advertisements', title: 'Advertisements', desc: 'Ad placements and media slots.' },
  { href: '/master/meta-settings', title: 'Meta Settings', desc: 'Global metadata defaults.' },
  { href: '/master/user-access', title: 'User Access', desc: 'Admins, roles, and access state.' },
  { href: '/master/custom-seo', title: 'Custom SEO', desc: 'Canonical, robots, and OG defaults.' },
  { href: '/master/sitemap', title: 'Sitemap', desc: 'Sitemap settings and exclusions.' },
  { href: '/master/page-logs', title: 'Page Logs', desc: 'Activity and admin change history.' },
];

export default function Page() {
  return (
    <DashboardShell>
      <Header title="Master & Others" subtitle="Master records and platform-wide settings grouped under one working parent screen." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="rounded-[28px] border border-line bg-panel/70 p-6 transition hover:border-gold/50 hover:bg-panel">
            <p className="text-xs uppercase tracking-[0.24em] text-gold">Master</p>
            <h2 className="mt-3 text-xl font-semibold text-text">{card.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{card.desc}</p>
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}
