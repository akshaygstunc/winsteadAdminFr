'use client';
import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Header } from '@/components/header';
import { DataTable } from '@/components/data-table';
import { api } from '@/lib/api';
export default function RequestsPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { api.get<any[]>('/requests').then(setItems).catch(() => undefined); }, []);
  const headers = items[0] ? Object.keys(items[0]).filter((k) => !['__v'].includes(k)).slice(0, 6) : ['Data'];
  return <DashboardShell><Header title="Requests" subtitle="Premium management module connected to the NestJS API." /><DataTable headers={headers}>{items.length ? items.map((item, i) => <tr key={item._id || i} className="border-t border-line text-muted">{Object.entries(item).filter(([k]) => !['__v'].includes(k)).slice(0, 6).map(([key, value]) => <td key={key} className="px-5 py-4 text-sm">{typeof value === 'string' ? value : JSON.stringify(value)}</td>)}</tr>) : <tr className="border-t border-line"><td className="px-5 py-6 text-muted">No records found.</td></tr>}</DataTable></DashboardShell>;
}
