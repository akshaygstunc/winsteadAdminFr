
"use client";

import { useEffect, useState, useMemo } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Header } from "@/components/header";
import { api } from "@/lib/api";
import { ActionButton, SectionCard, StatusBadge } from "@/components/ui";
import { SectionNotice } from "@/components/crud-kit";

// ─── Types ───────────────────────────────────────────────────────────────────

type ChangeFreq =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

interface SitemapEntry {
  _id: string;
  title: string;
  subtitle?: string;
  slug: string;
  status: "published" | "draft";
  pageType?: string;
  image?: string;
  updatedAt?: string;
  createdAt?: string;
  // sitemap-specific fields stored in data
  data?: {
    includeInSitemap?: boolean;
    sitemapPriority?: number;
    changefreq?: ChangeFreq;
    lastmod?: string;
    [key: string]: any;
  };
}

interface SitemapSettings {
  baseUrl: string;
  autoLastmod: boolean;
  defaultPriority: number;
  defaultChangefreq: ChangeFreq;
  excludeDrafts: boolean;
}

const CHANGE_FREQ_OPTIONS: ChangeFreq[] = [
  "always",
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "never",
];

const PRIORITY_OPTIONS = [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1];

const PAGE_TYPE_COLOR: Record<string, string> = {
  standard: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  blog: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  product: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  service: "bg-teal-500/10 text-teal-400 border-teal-500/20",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function priorityColor(p: number): string {
  if (p >= 0.8) return "#22c55e";
  if (p >= 0.5) return "#eab308";
  return "#94a3b8";
}

function buildXml(entries: SitemapEntry[], baseUrl: string): string {
  const base = baseUrl.replace(/\/$/, "");
  const included = entries.filter((e) => e.data?.includeInSitemap !== false && e.status === "published");

  const urls = included
    .map((e) => {
      const loc = `${base}/${e.slug}`.replace(/\/+/g, "/").replace(":/", "://");
      const priority = e.data?.sitemapPriority ?? 0.5;
      const changefreq = e.data?.changefreq ?? "weekly";
      const lastmod =
        e.data?.lastmod ||
        (e.updatedAt ? e.updatedAt.slice(0, 10) : new Date().toISOString().slice(0, 10));
      return `  <url>\n    <loc>${loc}</loc>\n    <priority>${priority.toFixed(1)}</priority>\n    <changefreq>${changefreq}</changefreq>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

function downloadXml(xml: string) {
  const blob = new Blob([xml], { type: "application/xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "sitemap.xml";
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="rounded-[20px] border border-line bg-panel/60 px-5 py-4">
      <p className="text-xs uppercase tracking-[0.2em] text-muted mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${accent || "text-text"}`}>{value}</p>
    </div>
  );
}

function PriorityBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-line overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: priorityColor(value) }}
        />
      </div>
      <span className="text-xs text-muted tabular-nums">{value.toFixed(1)}</span>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border transition-colors duration-200 ${
        checked ? "bg-green-500 border-green-500" : "bg-panel border-line"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 mt-[1px] ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function XmlHighlight({ xml }: { xml: string }) {
  const highlighted = xml
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/(&lt;\/?[\w?:]+)/g, '<span class="text-blue-400">$1</span>')
    .replace(/(&gt;)/g, '<span class="text-blue-400">$1</span>')
    .replace(/"([^"]*)"/g, '"<span class="text-green-400">$1</span>"');

  return (
    <pre
      className="text-[11px] leading-relaxed font-mono text-muted overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  );
}

// ─── Inline row editor ────────────────────────────────────────────────────────

function EntryRow({
  entry,
  index,
  onUpdate,
}: {
  entry: SitemapEntry;
  index: number;
  onUpdate: (id: string, patch: Partial<SitemapEntry["data"]>) => void;
}) {
  const included = entry.data?.includeInSitemap !== false && entry.status === "published";
  const priority = entry.data?.sitemapPriority ?? 0.5;
  const changefreq = entry.data?.changefreq ?? "weekly";
  const lastmod =
    entry.data?.lastmod || (entry.updatedAt ? entry.updatedAt.slice(0, 10) : "");

  const pageTypeClass =
    PAGE_TYPE_COLOR[entry.pageType || "standard"] ||
    "bg-panel text-muted border-line";

  return (
    <tr className="border-b border-line last:border-none hover:bg-card/40 transition-colors group">
      {/* # */}
      <td className="px-4 py-3 text-xs text-muted/60 tabular-nums">{index + 1}</td>

      {/* Title + slug */}
      <td className="px-4 py-3 min-w-[200px]">
        <div className="flex items-center gap-2">
          <div
            className="h-7 w-7 shrink-0 rounded-lg overflow-hidden border border-line bg-card"
          >
            {entry.image ? (
              <img src={entry.image} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-violet-500/10 to-gold/10" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-text leading-tight">{entry.title}</p>
            <p className="text-[11px] text-muted/60 font-mono">/{entry.slug}</p>
          </div>
        </div>
      </td>

      {/* Page type */}
      <td className="px-4 py-3">
        <span
          className={`inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full border ${pageTypeClass}`}
        >
          {entry.pageType || "standard"}
        </span>
      </td>

      {/* Priority */}
      <td className="px-4 py-3 min-w-[140px]">
        <div className="flex items-center gap-2">
          <PriorityBar value={priority} />
          <select
            value={priority}
            onChange={(e) =>
              onUpdate(entry._id, { sitemapPriority: Number(e.target.value) })
            }
            className="text-[11px] bg-panel border border-line rounded-lg px-1.5 py-1 text-text appearance-none cursor-pointer"
          >
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p.toFixed(1)}
              </option>
            ))}
          </select>
        </div>
      </td>

      {/* Change freq */}
      <td className="px-4 py-3">
        <select
          value={changefreq}
          onChange={(e) =>
            onUpdate(entry._id, { changefreq: e.target.value as ChangeFreq })
          }
          className="text-[11px] bg-panel border border-line rounded-lg px-2 py-1 text-text appearance-none cursor-pointer"
        >
          {CHANGE_FREQ_OPTIONS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </td>

      {/* Last modified */}
      <td className="px-4 py-3 min-w-[130px]">
        <input
          type="date"
          value={lastmod}
          onChange={(e) => onUpdate(entry._id, { lastmod: e.target.value })}
          className="text-[11px] bg-panel border border-line rounded-lg px-2 py-1 text-text cursor-pointer"
        />
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <StatusBadge
          value={entry.status || "draft"}
          tone={entry.status === "published" ? "green" : "slate"}
        />
      </td>

      {/* Include toggle */}
      <td className="px-4 py-3">
        <Toggle
          checked={included}
          onChange={(v) => onUpdate(entry._id, { includeInSitemap: v })}
        />
      </td>
    </tr>
  );
}

// ─── Settings panel ───────────────────────────────────────────────────────────

function SettingsPanel({
  settings,
  onChange,
}: {
  settings: SitemapSettings;
  onChange: (s: SitemapSettings) => void;
}) {
  const set = <K extends keyof SitemapSettings>(key: K, value: SitemapSettings[K]) =>
    onChange({ ...settings, [key]: value });

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs uppercase tracking-[0.2em] text-muted block mb-1.5">
          Base URL
        </label>
        <input
          type="url"
          value={settings.baseUrl}
          onChange={(e) => set("baseUrl", e.target.value)}
          placeholder="https://yoursite.com"
          className="input w-full text-sm"
        />
        <p className="mt-1 text-xs text-muted">
          All page slugs will be appended to this URL.
        </p>
      </div>

      <div>
        <label className="text-xs uppercase tracking-[0.2em] text-muted block mb-1.5">
          Default priority
        </label>
        <select
          value={settings.defaultPriority}
          onChange={(e) => set("defaultPriority", Number(e.target.value))}
          className="input w-full text-sm"
        >
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p.toFixed(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs uppercase tracking-[0.2em] text-muted block mb-1.5">
          Default change frequency
        </label>
        <select
          value={settings.defaultChangefreq}
          onChange={(e) => set("defaultChangefreq", e.target.value as ChangeFreq)}
          className="input w-full text-sm"
        >
          {CHANGE_FREQ_OPTIONS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-3 rounded-2xl border border-line bg-panel px-4 py-3 text-sm text-text cursor-pointer">
        <input
          type="checkbox"
          checked={settings.autoLastmod}
          onChange={(e) => set("autoLastmod", e.target.checked)}
        />
        <div>
          <p className="font-medium text-sm">Auto lastmod</p>
          <p className="text-xs text-muted">Use page's last updated date automatically</p>
        </div>
      </label>

      <label className="flex items-center gap-3 rounded-2xl border border-line bg-panel px-4 py-3 text-sm text-text cursor-pointer">
        <input
          type="checkbox"
          checked={settings.excludeDrafts}
          onChange={(e) => set("excludeDrafts", e.target.checked)}
        />
        <div>
          <p className="font-medium text-sm">Exclude drafts</p>
          <p className="text-xs text-muted">Draft pages are always excluded from sitemap</p>
        </div>
      </label>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SitemapDetailsPage() {
  const [entries, setEntries] = useState<SitemapEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterIncluded, setFilterIncluded] = useState("all");
  const [xmlCopied, setXmlCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"pages" | "settings" | "preview">("pages");
  const [settings, setSettings] = useState<SitemapSettings>({
    baseUrl: "https://yoursite.com",
    autoLastmod: true,
    defaultPriority: 0.5,
    defaultChangefreq: "weekly",
    excludeDrafts: true,
  });

  // ── Load all CMS entities that have slugs ──
  const load = async () => {
    setLoading(true);
    try {
      // Adjust endpoint to your real entity list — fetching "pages" as example
      const rows = await api.get<SitemapEntry[]>(`/content/pages`);
      setEntries(rows || []);
    } catch {
      setError("Failed to load pages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ── Derived stats ──
  const publishedEntries = useMemo(
    () => entries.filter((e) => e.status === "published"),
    [entries]
  );
  const includedEntries = useMemo(
    () => publishedEntries.filter((e) => e.data?.includeInSitemap !== false),
    [publishedEntries]
  );
  const excludedCount = entries.length - includedEntries.length;

  // ── Filtered view ──
  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const q = search.toLowerCase();
      if (q && !e.title.toLowerCase().includes(q) && !e.slug.includes(q)) return false;
      if (filterType !== "all" && e.pageType !== filterType) return false;
      if (filterStatus !== "all" && e.status !== filterStatus) return false;
      if (filterIncluded === "included" && e.data?.includeInSitemap === false) return false;
      if (filterIncluded === "excluded" && e.data?.includeInSitemap !== false) return false;
      return true;
    });
  }, [entries, search, filterType, filterStatus, filterIncluded]);

  // ── Unique page types for filter dropdown ──
  const pageTypes = useMemo(
    () => ["all", ...Array.from(new Set(entries.map((e) => e.pageType || "standard")))],
    [entries]
  );

  // ── Update a single entry ──
  const updateEntry = async (id: string, patch: Partial<SitemapEntry["data"]>) => {
    // Optimistic update
    setEntries((prev) =>
      prev.map((e) =>
        e._id === id ? { ...e, data: { ...(e.data || {}), ...patch } } : e
      )
    );

    setSaving(id);
    try {
      await api.patch(`/content/pages/${id}`, {
        data: {
          ...entries.find((e) => e._id === id)?.data,
          ...patch,
        },
      });
    } catch {
      setError("Failed to save change.");
    } finally {
      setSaving(null);
    }
  };

  // ── Bulk actions ──
  const includeAll = () => {
    filtered.forEach((e) => updateEntry(e._id, { includeInSitemap: true }));
  };
  const excludeAll = () => {
    filtered.forEach((e) => updateEntry(e._id, { includeInSitemap: false }));
  };

  // ── XML generation ──
  const xml = useMemo(
    () => buildXml(entries, settings.baseUrl),
    [entries, settings.baseUrl]
  );

  const copyXml = async () => {
    await navigator.clipboard.writeText(xml);
    setXmlCopied(true);
    setTimeout(() => setXmlCopied(false), 2000);
  };

  const regenerate = async () => {
    try {
      // Optionally ping your backend to regenerate the static sitemap.xml file
      // await api.post("/sitemap/regenerate", {});
      setMessage("Sitemap regenerated successfully.");
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setError("Failed to regenerate sitemap.");
    }
  };

  const selectClass =
    "text-sm bg-panel border border-line rounded-2xl px-3 py-2 text-text appearance-none cursor-pointer focus:outline-none focus:border-gold";

  return (
    <DashboardShell>
      <Header
        title="Sitemap"
        subtitle="Generate and configure sitemap functionality for SEO."
      />

   <div className="space-y-8">

  {/* HERO */}
  <div className="rounded-[32px] border border-line bg-gradient-to-br from-panel to-card p-8">
    <div className="max-w-5xl">
      <p className="text-xs uppercase tracking-[0.25em] text-gold mb-3">
        WEBSITE CMS DASHBOARD
      </p>

      <h1 className="text-4xl font-semibold text-text leading-tight">
        Manage Website Content, Pages, SEO & Navigation
      </h1>

      <p className="mt-4 text-muted text-lg leading-relaxed">
        This dashboard allows admins, editors and marketing teams to manage
        all frontend website sections from a centralized CMS system.
      </p>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">

        <div className="rounded-2xl border border-line bg-card p-4">
          <p className="text-2xl font-semibold text-text">30+</p>
          <p className="text-xs text-muted mt-1">CMS Modules</p>
        </div>

        <div className="rounded-2xl border border-line bg-card p-4">
          <p className="text-2xl font-semibold text-green-400">
            {publishedEntries.length}
          </p>
          <p className="text-xs text-muted mt-1">Published Pages</p>
        </div>

        <div className="rounded-2xl border border-line bg-card p-4">
          <p className="text-2xl font-semibold text-blue-400">
            SEO Ready
          </p>
          <p className="text-xs text-muted mt-1">Sitemap Connected</p>
        </div>

        <div className="rounded-2xl border border-line bg-card p-4">
          <p className="text-2xl font-semibold text-violet-400">
            Live
          </p>
          <p className="text-xs text-muted mt-1">Frontend Connected</p>
        </div>

      </div>
    </div>
  </div>

  {/* MAIN */}
  <SectionCard
    title="Main Dashboard Modules"
    subtitle="Core website management modules."
  >
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

      {[
        {
          title: "Dashboard",
          desc: "Overall website analytics, updates and activity.",
          impact: "Admin Overview",
        },
        {
          title: "Contact Query",
          desc: "Manage contact form submissions and inquiries.",
          impact: "Lead Management",
        },
        {
          title: "Properties",
          desc: "Manage property listings, pricing and galleries.",
          impact: "Property Pages",
        },
        {
          title: "Podcast",
          desc: "Manage podcast episodes and media.",
          impact: "Media Pages",
        },
        {
          title: "Blogs",
          desc: "Manage blog articles and SEO content.",
          impact: "SEO & Traffic",
        },
        {
          title: "News & Media",
          desc: "Manage news articles and press releases.",
          impact: "Marketing",
        },
        {
          title: "Events",
          desc: "Manage events and campaigns.",
          impact: "Events Page",
        },
        {
          title: "Careers",
          desc: "Manage jobs and career opportunities.",
          impact: "Career Page",
        },
        {
          title: "Assets",
          desc: "Manage PDFs, brochures and uploaded files.",
          impact: "Media Library",
        },
      ].map((item) => (
        <div
          key={item.title}
          className="rounded-3xl border border-line bg-panel p-5"
        >
          <h3 className="text-lg font-semibold text-text">
            {item.title}
          </h3>

          <p className="mt-3 text-sm text-muted leading-relaxed">
            {item.desc}
          </p>

          <div className="mt-5 rounded-2xl bg-card border border-line p-4">
            <p className="text-xs uppercase tracking-wider text-muted">
              Frontend Impact
            </p>

            <p className="mt-2 text-sm text-text">
              {item.impact}
            </p>
          </div>
        </div>
      ))}

    </div>
  </SectionCard>

  {/* CUSTOMIZATION */}
  <SectionCard
    title="Customization & Navigation"
    subtitle="Manage menus and frontend navigation structure."
  >
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

      {[
        {
          title: "Top Menu",
          desc: "Controls website header navigation and mega menus.",
        },
        {
          title: "Footer Menu",
          desc: "Controls footer quick links and navigation.",
        },
        {
          title: "Footer Menu 2",
          desc: "Controls legal and secondary footer links.",
        },
        {
          title: "Developer",
          desc: "Manage developer profile pages and builders.",
        },
        {
          title: "Developer communities",
          desc: "Manage grouped developer projects.",
        },
      ].map((item) => (
        <div
          key={item.title}
          className="rounded-3xl border border-line bg-panel p-5"
        >
          <h3 className="text-lg font-semibold text-text">
            {item.title}
          </h3>

          <p className="mt-3 text-sm text-muted leading-relaxed">
            {item.desc}
          </p>
        </div>
      ))}

    </div>
  </SectionCard>

  {/* MASTER */}
  <SectionCard
    title="Master Data Management"
    subtitle="Reusable property and website master configurations."
  >
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

      {[
        "Testimonials",
        "Amenities",
        "Floor Plans",
        "Property Types",
        "Property Sub-Types",
        "Locations",
        "SubLocation",
      ].map((title) => (
        <div
          key={title}
          className="rounded-3xl border border-line bg-panel p-5"
        >
          <h3 className="text-lg font-semibold text-text">
            {title}
          </h3>

          <p className="mt-3 text-sm text-muted">
            Manage reusable master content connected across multiple pages.
          </p>
        </div>
      ))}

    </div>
  </SectionCard>

  {/* STATIC PAGES */}
  <SectionCard
    title="Website Pages"
    subtitle="Manage frontend static pages and layouts."
  >
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

      {[
        "Home",
        "About Us",
        "Our Services",
        "Projects Page",
        "Team Page",
        "Privacy Page",
        "Term Page",
        "Developer Page",
        "Contact Us Page",
        "Events Page",
        "Career Page",
      ].map((title) => (
        <div
          key={title}
          className="rounded-3xl border border-line bg-panel p-5"
        >
          <h3 className="text-lg font-semibold text-text">
            {title}
          </h3>

          <p className="mt-3 text-sm text-muted">
            Controls frontend content, banners, SEO and layout sections.
          </p>
        </div>
      ))}

    </div>
  </SectionCard>

  {/* USER ACCESS */}
  <SectionCard
    title="User Access & Permissions"
    subtitle="Manage admin access and CMS permissions."
  >
    <div className="rounded-3xl border border-line bg-panel p-6">
      <h3 className="text-xl font-semibold text-text">
        User Access
      </h3>

      <p className="mt-3 text-muted leading-relaxed">
        Manage admin users, editor permissions, roles and access control
        for the CMS dashboard.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <div className="rounded-2xl bg-card border border-line px-4 py-3">
          <p className="text-xs text-muted">Role Management</p>
        </div>

        <div className="rounded-2xl bg-card border border-line px-4 py-3">
          <p className="text-xs text-muted">Admin Permissions</p>
        </div>

        <div className="rounded-2xl bg-card border border-line px-4 py-3">
          <p className="text-xs text-muted">Editor Access</p>
        </div>
      </div>
    </div>
  </SectionCard>

</div>
    </DashboardShell>
  );
}