import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { Header } from "@/components/header";

const cards = [
  {
    href: "/customization/footer-menu",
    title: "Footer Menu",
    desc: "Footer navigation blocks and grouped links.",
  },
  {
    href: "/customization/footer-menu-2",
    title: "Footer Menu 2",
    desc: "Secondary footer navigation group.",
  },
  {
    href: "/customization/categories",
    title: "Categories",
    desc: "Website category taxonomy and listing cards.",
  },
  {
    href: "/customization/developer-community",
    title: "Developer Community",
    desc: "Developer partners, logos, and city tagging.",
  },
  {
    href: "/customization/mega-category-ads",
    title: "Mega Category Ads",
    desc: "Promotional banners for large category sections.",
  },
];

export default function Page() {
  return (
    <DashboardShell>
      <Header
        title="Customization"
        subtitle="Website customization modules grouped under a stable parent route."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-[28px] border border-line bg-panel/70 p-6 transition hover:border-gold/50 hover:bg-panel"
          >
            <p className="text-xs uppercase tracking-[0.24em] text-gold">
              Customization
            </p>
            <h2 className="mt-3 text-xl font-semibold text-text">
              {card.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">{card.desc}</p>
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}
