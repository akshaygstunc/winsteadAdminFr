import { ReactNode } from 'react';
import { Sidebar } from './sidebar';

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex max-w-[1680px] gap-6 p-6">
      <Sidebar />
      <section className="min-w-0 flex-1">{children}</section>
    </main>
  );
}
