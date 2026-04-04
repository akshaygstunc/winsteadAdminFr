'use client';
import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Header } from '@/components/header';
import { DataTable } from '@/components/data-table';
import { api } from '@/lib/api';
import { WorkspaceSnapshot } from '@/lib/types';
import { MetricTile, SectionCard, StatusBadge } from '@/components/ui';

export default function DashboardPage() {
  const [data, setData] = useState<WorkspaceSnapshot | null>(null);
  useEffect(() => {
    api.get<WorkspaceSnapshot>('/workspace/snapshot').then(setData).catch(() => undefined);
  }, []);
  return (
    <DashboardShell>
      <Header title="Welcome to Dashboard" subtitle="This pass restructures the starter around the actual screens visible in the video: properties, contact queues, assessments, tasks, media, icons, about, and playbooks." />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <MetricTile label="Active Properties" value={data?.stats.activeListings ?? '--'} note="Live inventory currently shown in the system." />
        <MetricTile label="Contact Queues" value={data?.contactQueues.length ?? '--'} note="Queue items waiting for review or publishing." />
        <MetricTile label="Lead Conversion" value={data ? `${data.stats.conversionRate}%` : '--'} note="Qualified lead progression inside the luxury funnel." />
        <MetricTile label="Pending Assessments" value={data?.stats.pendingAssessments ?? '--'} note="Assessments that still need scheduling or review." />
        <MetricTile label="Open Tasks" value={data?.stats.openTasks ?? '--'} note="Operational work still moving through the approval flow." />
        <MetricTile label="Playbooks" value={data?.playbooks.length ?? '--'} note="Reusable workflows and guided scripts for the team." />
      </div>
      <div className="mt-6 panel-grid">
        <SectionCard title="Featured Properties" subtitle="Close match to the listing-heavy screen shown in the walkthrough.">
          <DataTable headers={['Property', 'Location', 'Price', 'Status']}>
            {(data?.properties || []).slice(0, 5).map((property) => (
              <tr key={property.title} className="border-t border-line text-sm text-muted">
                <td className="px-5 py-4 text-text">{property.title}</td>
                <td className="px-5 py-4">{property.location}</td>
                <td className="px-5 py-4">${property.price.toLocaleString()}</td>
                <td className="px-5 py-4"><StatusBadge value={property.status} tone={property.status === 'available' ? 'green' : property.status === 'booked' ? 'gold' : 'slate'} /></td>
              </tr>
            ))}
          </DataTable>
        </SectionCard>
        <SectionCard title="Assessment Requests" subtitle="Card-based review flow similar to the request review screen.">
          <div className="grid gap-4 md:grid-cols-2">
            {(data?.assessmentRequests || []).slice(0, 4).map((request) => (
              <div key={request.id} className="rounded-3xl border border-line bg-panel/60 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-text">{request.name}</p>
                    <p className="mt-1 text-sm text-muted">{request.city} • {request.intent}</p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line bg-white/5 text-sm font-semibold text-gold">{request.avatar}</div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-line bg-card/70 p-3"><p className="text-xs uppercase tracking-[0.24em] text-gold">Budget</p><p className="mt-2 text-sm text-text">{request.budget}</p></div>
                  <div className="rounded-2xl border border-line bg-card/70 p-3"><p className="text-xs uppercase tracking-[0.24em] text-gold">Stage</p><p className="mt-2 text-sm text-text">{request.stage}</p></div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </DashboardShell>
  );
}
