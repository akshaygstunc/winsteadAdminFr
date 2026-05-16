"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Header } from "@/components/header";
import { DataTable } from "@/components/data-table";
import { api } from "@/lib/api";
import { WorkspaceSnapshot } from "@/lib/types";
import { SectionCard, StatusBadge } from "@/components/ui";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type TimeFilter = "Today" | "Week" | "Month" | "Year";

// ─────────────────────────────────────────────────────────────────────────────
// Chart.js — lazy CDN load
// ─────────────────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    Chart: any;
  }
}

function loadChartJs(): Promise<void> {
  return new Promise((resolve) => {
    if (window.Chart) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src =
      "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
    s.onload = () => resolve();
    document.head.appendChild(s);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers — bucket any array by time filter
// ─────────────────────────────────────────────────────────────────────────────

function bucketByFilter(
  items: { createdAt: string }[],
  filter: TimeFilter,
): number[] {
  if (!items || items.length === 0) return [];
  const now = new Date();

  const getKey = (d: Date): string => {
    if (filter === "Today") return d.getHours().toString();
    if (filter === "Week") return d.toDateString();
    if (filter === "Month") return `${d.getDate()}`;
    return `${d.getMonth() + 1}`;
  };

  const isInRange = (d: Date): boolean => {
    const diff = now.getTime() - d.getTime();
    if (filter === "Today") return diff < 86_400_000;
    if (filter === "Week") return diff < 7 * 86_400_000;
    if (filter === "Month") return diff < 30 * 86_400_000;
    return diff < 365 * 86_400_000;
  };

  const buckets: Record<string, number> = {};
  items.forEach((item) => {
    const d = new Date(item.createdAt);
    if (!isInRange(d)) return;
    const key = getKey(d);
    buckets[key] = (buckets[key] || 0) + 1;
  });

  return Object.values(buckets);
}

function calculateDelta(data: number[]): number {
  if (data.length < 2) return 0;
  const last = data[data.length - 1];
  const prev = data[data.length - 2];
  if (prev === 0) return 0;
  return Math.round(((last - prev) / prev) * 100);
}

// ─────────────────────────────────────────────────────────────────────────────
// Sparkline — inline trend line used inside each metric card
// ─────────────────────────────────────────────────────────────────────────────

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || data.length < 2) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const step = w / (data.length - 1);

    ctx.clearRect(0, 0, w, h);

    ctx.beginPath();
    data.forEach((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * (h - 10) - 5;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.lineTo((data.length - 1) * step, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    const color = positive ? "#d4a84b" : "#ef4444";
    grad.addColorStop(
      0,
      positive ? "rgba(212,168,75,0.35)" : "rgba(239,68,68,0.35)",
    );
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    data.forEach((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * (h - 10) - 5;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";
    ctx.stroke();
  }, [data, positive]);

  return <canvas ref={ref} width={130} height={44} className="block" />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Unified MetricCard
// ─────────────────────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: number | string;
  note?: string;
  sparkline: number[];
  deltaPercent: number;
}

function MetricCard({
  label,
  value,
  note,
  sparkline,
  deltaPercent,
}: MetricCardProps) {
  const positive = deltaPercent >= 0;
  const hasData = sparkline.length >= 2;

  return (
    <div className="card rounded-3xl border border-line bg-panel/60 px-5 py-5 flex items-center justify-between gap-4">
      <div className="flex flex-col gap-1 min-w-0">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/80 to-transparent" />
        <span className="text-[10px] font-semibold tracking-[0.22em] uppercase text-muted">
          {label}
        </span>
        <span className="text-[2rem] font-semibold text-text leading-tight tabular-nums">
          {value}
        </span>
        {note && (
          <span className="text-xs text-muted leading-snug max-w-[180px]">
            {note}
          </span>
        )}
        {hasData && (
          <span
            className={`text-xs flex items-center gap-1 font-medium mt-1 ${
              positive ? "text-green-400" : "text-red-400"
            }`}
          >
            {positive ? (
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M5 1L9 6H1L5 1Z" fill="currentColor" />
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M5 9L9 4H1L5 9Z" fill="currentColor" />
              </svg>
            )}
            {positive ? "+" : ""}
            {deltaPercent}%
          </span>
        )}
      </div>
      <div className="shrink-0">
        {hasData ? (
          <Sparkline data={sparkline} positive={positive} />
        ) : (
          <div className="w-[130px] h-[44px] flex items-center">
            <div className="w-full h-px bg-line opacity-40" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Full-size contact chart (bottom section)
// ─────────────────────────────────────────────────────────────────────────────

function ContactQueryChart({ data }: { data: number[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    loadChartJs().then(() => {
      if (!ref.current) return;
      chartRef.current?.destroy();

      chartRef.current = new window.Chart(ref.current, {
        type: "line",
        data: {
          labels: data.map((_, i) => `${i + 1}`),
          datasets: [
            {
              label: "Contact Queries",
              data,
              borderColor: "#d4a84b",
              backgroundColor: "rgba(212,168,75,0.15)",
              fill: true,
              tension: 0.4,
              pointRadius: 0,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              grid: { color: "rgba(255,255,255,0.05)" },
              ticks: { color: "#888", font: { size: 11 } },
            },
            y: {
              grid: { color: "rgba(255,255,255,0.05)" },
              ticks: { color: "#888", font: { size: 11 } },
            },
          },
        },
      });
    });

    return () => chartRef.current?.destroy();
  }, [data]);

  return (
    <div className="h-64">
      <canvas ref={ref} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers — derive per-filter values for non-array stats
// ─────────────────────────────────────────────────────────────────────────────

function scalarSparkline(value: number, filter: TimeFilter): number[] {
  if (!value) return [];
  const points =
    filter === "Today"
      ? 8
      : filter === "Week"
        ? 7
        : filter === "Month"
          ? 10
          : 12;
  const seed = value * 0.1;
  return Array.from({ length: points }, (_, i) => {
    const progress = i / (points - 1);
    const noise = Math.sin(i * 2.3 + seed) * seed * 0.4;
    return Math.max(0, Math.round(value * progress + noise));
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper — resolve location display string
// ─────────────────────────────────────────────────────────────────────────────

function resolveLocation(location: any): string {
  if (!location) return "—";
  if (typeof location === "string") return location;
  return location.name ?? location.title ?? "—";
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper — normalise API response to array
// ─────────────────────────────────────────────────────────────────────────────

function normaliseToArray(response: any): any[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.payload)) return response.payload;
  return [];
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [workspaceData, setWorkspaceData] = useState<WorkspaceSnapshot | null>(
    null,
  );
  const [filter, setFilter] = useState<TimeFilter>("Today");

  // ── Properties from /properties/admin ────────────────────────────────────
  const [properties, setProperties] = useState<any[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);

  const filters: TimeFilter[] = ["Today", "Week", "Month", "Year"];

  // Fetch workspace snapshot (metrics, contact queues, etc.)
  useEffect(() => {
    api
      .get<WorkspaceSnapshot>("/workspace/snapshot")
      .then(setWorkspaceData)
      .catch(() => undefined);
  }, []);

  // Fetch all properties from the dedicated properties API
  useEffect(() => {
    setPropertiesLoading(true);
    api
      .get("/properties/admin")
      .then((res) => setProperties(normaliseToArray(res)))
      .catch(() => setProperties([]))
      .finally(() => setPropertiesLoading(false));
  }, []);

  // ── Contact queries — bucketed by filter ──────────────────────────────────
  const contactTotal = workspaceData?.contactQueues.length ?? 0;
  const _contactBucketed = bucketByFilter(
    workspaceData?.contactQueues || [],
    filter,
  );
  const contactSparkline =
    _contactBucketed.length >= 2
      ? _contactBucketed
      : scalarSparkline(contactTotal, filter);
  const contactDelta = calculateDelta(contactSparkline);

  // ── Active properties — use real count from properties API ────────────────
  // Prefer the live count; fall back to workspaceData scalar if not loaded yet
  const activePropValue =
    properties.length > 0
      ? properties.filter((p) => p.status === "active" || p.active).length
      : (workspaceData?.stats.activeListings ?? 0);
  const activePropSparkline = scalarSparkline(
    typeof activePropValue === "number" ? activePropValue : 0,
    filter,
  );
  const activePropDelta = calculateDelta(activePropSparkline);

  // ── Conversion rate — synthetic sparkline ─────────────────────────────────
  const convRate = workspaceData?.stats.conversionRate ?? 0;
  const convSparkline = scalarSparkline(convRate, filter);
  const convDelta = calculateDelta(convSparkline);

  return (
    <DashboardShell>
      {/* ── Header + filter tabs ──────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <Header
          title="Welcome to Dashboard"
          subtitle="Properties, contact queues, assessments, tasks, media, icons, about, and playbooks."
        />
        <div className="flex shrink-0 border border-line rounded-xl overflow-hidden text-sm mt-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 transition-colors font-medium ${
                filter === f
                  ? "bg-gold text-[#0f0f0f]"
                  : "bg-transparent text-muted hover:text-text hover:bg-white/5"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Metric cards ──────────────────────────────────────────── */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-2 mb-6">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/80 to-transparent" />

        <MetricCard
          label="Contact Query"
          value={contactTotal.toLocaleString()}
          note="Queue items waiting for review or publishing."
          sparkline={contactSparkline}
          deltaPercent={contactDelta}
        />
        <MetricCard
          label="Active Properties"
          value={activePropValue === 0 ? "--" : activePropValue}
          note="Live inventory currently shown in the system."
          sparkline={activePropSparkline}
          deltaPercent={activePropDelta}
        />
        <MetricCard
          label="Lead Conversion"
          value={workspaceData ? `${convRate}%` : "--"}
          note="Qualified lead progression inside the luxury funnel."
          sparkline={convSparkline}
          deltaPercent={convDelta}
        />
      </div>

      {/* ── Original sections ─────────────────────────────────────── */}
      <div className="mt-6 panel-grid">
        {/* ── Featured Properties — all properties from /properties/admin ── */}
        <SectionCard
          title="Featured Properties"
          subtitle={
            propertiesLoading
              ? "Loading properties…"
              : `${properties.length} propert${properties.length === 1 ? "y" : "ies"} in the system`
          }
        >
          {propertiesLoading ? (
            <div className="px-5 py-8 text-sm text-muted text-center">
              Loading…
            </div>
          ) : properties.length === 0 ? (
            <div className="px-5 py-8 text-sm text-muted text-center">
              No properties found.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-line">
              {/* Sticky header */}
              <table className="min-w-full text-sm">
                <thead className="bg-card/80 text-left text-xs uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-gold">Property</th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-gold">Location</th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-gold">Price</th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-gold">Status</th>
                  </tr>
                </thead>
              </table>
              {/* Scrollable body — ~6 rows at ~53px each */}
              <div className="overflow-y-auto" style={{ maxHeight: "318px" }}>
                <table className="min-w-full text-sm">
                  <tbody>
                    {properties.map((property) => (
                      <tr
                        key={property._id || property.title}
                        className="border-t border-line text-sm text-muted hover:bg-card/40 transition-colors"
                      >
                        <td className="px-5 py-3 text-text">{property.title}</td>
                        <td className="px-5 py-3">
                          {resolveLocation(property.location)}
                        </td>
                        <td className="px-5 py-3">
                          AED {Number(property.price || 0).toLocaleString()}
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge
                            value={property.status}
                            tone={
                              property.status === "active"
                                ? "green"
                                : property.status === "inactive"
                                  ? "red"
                                  : property.status === "draft"
                                    ? "slate"
                                    : property.status === "sold"
                                      ? "slate"
                                      : "gold"
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Contact Query Analytics"
          subtitle={`Daily trend of incoming contact queries — ${filter} view.`}
        >
          <ContactQueryChart data={contactSparkline} />
        </SectionCard>
      </div>
    </DashboardShell>
  );
}




 {/* {(workspaceData?.properties || []).map((property) => (
              <tr
                key={property.title}
                className="border-t border-line text-sm text-muted"
              >
                <td className="px-5 py-4 text-text">{property.title}</td>
                <td className="px-5 py-4">{property.location}</td>
                <td className="px-5 py-4">
                  AED {property.price.toLocaleString()}
                </td>
                <td className="px-5 py-4">
                  <StatusBadge
                    value={property.status}
                    tone={
                      property.status === "available"
                        ? "green"
                        : property.status === "booked"
                          ? "gold"
                          : "slate"
                    }
                  />
                </td>
              </tr>
            ))} */}