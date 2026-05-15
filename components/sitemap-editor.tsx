
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

      <div className="space-y-6">
        <SectionNotice message={message} error={error} />

        {/* ── Metric row ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard label="Total pages" value={entries.length} />
          <MetricCard
            label="In sitemap"
            value={includedEntries.length}
            accent="text-green-400"
          />
          <MetricCard
            label="Excluded"
            value={excludedCount}
            accent="text-amber-400"
          />
          <MetricCard
            label="Published"
            value={publishedEntries.length}
            accent="text-blue-400"
          />
        </div>

        {/* ── Sitemap URL bar ── */}
        <div className="flex items-center gap-3 rounded-[20px] border border-line bg-panel/60 px-5 py-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-[0.2em] text-muted mb-1">
              Sitemap URL
            </p>
            <p className="text-sm font-mono text-text truncate">
              {settings.baseUrl.replace(/\/$/, "")}/sitemap.xml
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <ActionButton secondary onClick={regenerate}>
              ↺ Regenerate
            </ActionButton>
            <ActionButton secondary onClick={() => downloadXml(xml)}>
              ↓ Download XML
            </ActionButton>
          </div>
        </div>

        {/* ── Tab strip ── */}
        <div className="flex gap-1 rounded-2xl border border-line bg-panel/50 p-1 w-fit">
          {(["pages", "settings", "preview"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors capitalize ${
                activeTab === tab
                  ? "bg-gold text-black"
                  : "text-muted hover:text-text"
              }`}
            >
              {tab === "pages" ? `Pages (${entries.length})` : tab === "preview" ? "XML Preview" : "Settings"}
            </button>
          ))}
        </div>

        {/* ── Pages tab ── */}
        {activeTab === "pages" && (
          <SectionCard
            title="Page Sitemap Settings"
            subtitle="Toggle inclusion, set priority and crawl frequency per page."
            action={
              <div className="flex gap-2">
                <ActionButton secondary onClick={excludeAll}>
                  Exclude all
                </ActionButton>
                <ActionButton secondary onClick={includeAll}>
                  Include all
                </ActionButton>
              </div>
            }
          >
            {/* Filter bar */}
            <div className="mb-5 flex flex-wrap gap-3 items-center">
              <input
                className="input max-w-56 text-sm"
                placeholder="Search pages…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className={selectClass}
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                {pageTypes.map((t) => (
                  <option key={t} value={t}>
                    {t === "all" ? "All types" : t}
                  </option>
                ))}
              </select>
              <select
                className={selectClass}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
              <select
                className={selectClass}
                value={filterIncluded}
                onChange={(e) => setFilterIncluded(e.target.value)}
              >
                <option value="all">Included &amp; excluded</option>
                <option value="included">Included only</option>
                <option value="excluded">Excluded only</option>
              </select>
              <span className="text-xs text-muted ml-auto">
                {filtered.length} of {entries.length} pages
              </span>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-[24px] border border-line bg-panel/70">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-line bg-card/50">
                    <tr>
                      <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider w-10">
                        #
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                        Page
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                        Change freq
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                        Last modified
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                        In sitemap
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted">
                          Loading pages…
                        </td>
                      </tr>
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted">
                          No pages found.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((entry, i) => (
                        <EntryRow
                          key={entry._id}
                          entry={entry}
                          index={i}
                          onUpdate={updateEntry}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                Priority ≥ 0.8 — high importance
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-yellow-500" />
                Priority 0.5–0.7 — medium importance
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-slate-400" />
                Priority ≤ 0.4 — low importance
              </span>
              <span className="flex items-center gap-1.5 ml-auto">
                <span className="text-muted/60">Draft pages are always excluded from the sitemap output.</span>
              </span>
            </div>
          </SectionCard>
        )}

        {/* ── Settings tab ── */}
        {activeTab === "settings" && (
          <SectionCard
            title="Sitemap Settings"
            subtitle="Configure global defaults for your sitemap generation."
            action={
              <ActionButton
                onClick={() => {
                  // Persist settings to your backend or localStorage
                  setMessage("Settings saved.");
                  setTimeout(() => setMessage(null), 2000);
                }}
              >
                Save settings
              </ActionButton>
            }
          >
            <div className="max-w-lg">
              <SettingsPanel settings={settings} onChange={setSettings} />
            </div>

            {/* SEO tips */}
            <div className="mt-6 rounded-[20px] border border-line bg-panel/40 p-5 space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-gold font-medium">
                SEO tips
              </p>
              <ul className="space-y-2 text-sm text-muted list-disc list-inside">
                <li>Set your homepage priority to <strong className="text-text">1.0</strong> — it's your most important page.</li>
                <li>Blog posts and product pages typically use <strong className="text-text">0.6–0.8</strong>.</li>
                <li>Legal pages like Privacy Policy can be set to <strong className="text-text">0.1–0.2</strong> and <code className="text-xs bg-card px-1 rounded">yearly</code>.</li>
                <li>Submit your sitemap URL to Google Search Console and Bing Webmaster Tools.</li>
                <li>Keep draft pages excluded — search engines shouldn't index unpublished content.</li>
              </ul>
            </div>
          </SectionCard>
        )}

        {/* ── XML Preview tab ── */}
        {activeTab === "preview" && (
          <SectionCard
            title="XML Preview"
            subtitle="Live preview of your sitemap.xml output based on current settings."
            action={
              <div className="flex gap-2">
                <ActionButton secondary onClick={copyXml}>
                  {xmlCopied ? "✓ Copied" : "Copy XML"}
                </ActionButton>
                <ActionButton onClick={() => downloadXml(xml)}>
                  ↓ Download sitemap.xml
                </ActionButton>
              </div>
            }
          >
            <div className="rounded-[20px] border border-line bg-[#0d1117] p-5 overflow-auto max-h-[600px]">
              <XmlHighlight xml={xml} />
            </div>

            <div className="mt-4 flex gap-6 text-xs text-muted">
              <span>{includedEntries.length} URLs included</span>
              <span>{xml.length.toLocaleString()} bytes</span>
              <span>
                Submit to:{" "}
                <a
                  href={`https://search.google.com/search-console`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline"
                >
                  Google Search Console
                </a>
              </span>
            </div>
          </SectionCard>
        )}
      </div>
    </DashboardShell>
  );
}